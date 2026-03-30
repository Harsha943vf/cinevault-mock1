import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8082/api";

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = localStorage.getItem("cv_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `Error ${res.status}`);
  return json;
}

const GENRES = ["Action", "Drama", "Sci-Fi", "Thriller", "Comedy", "Horror", "Romance", "Animation"];

// ─── Styles ───────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24;
    --border: rgba(255,255,255,0.07); --gold: #d4a843;
    --gold-dim: rgba(212,168,67,0.15); --red: #e84040;
    --red-dim: rgba(232,64,64,0.15); --text: #f0ede8;
    --text-muted: rgba(240,237,232,0.45); --text-dim: rgba(240,237,232,0.7);
    --accent: #5b6af0; --accent-dim: rgba(91,106,240,0.15); --success: #43d475;
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  input, textarea, select {
    font-family: 'DM Sans', sans-serif; background: var(--surface2);
    border: 1px solid var(--border); color: var(--text); border-radius: 8px;
    padding: 10px 14px; width: 100%; font-size: 14px; outline: none; transition: border-color 0.2s;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--gold); }
  select option { background: var(--surface2); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── Reusable Components ──────────────────────────────────────────────────────
const Btn = ({ children, variant = "primary", onClick, style = {}, disabled, small }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, border: "none",
    cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    fontSize: small ? 12 : 14, padding: small ? "6px 14px" : "10px 22px",
    transition: "all 0.2s", opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: "var(--gold)", color: "#0a0a0f" },
    danger:  { background: "var(--red)", color: "#fff" },
    ghost:   { background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" },
    accent:  { background: "var(--accent)", color: "#fff" },
    success: { background: "var(--success)", color: "#0a0a0f" },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Badge = ({ children, color = "gold" }) => {
  const colors = {
    gold: { bg: "var(--gold-dim)", text: "var(--gold)" },
    red:  { bg: "var(--red-dim)", text: "var(--red)" },
    accent: { bg: "var(--accent-dim)", text: "var(--accent)" },
    green: { bg: "rgba(67,212,117,0.15)", text: "var(--success)" },
  };
  return (
    <span style={{
      background: colors[color].bg, color: colors[color].text,
      fontSize: 11, fontWeight: 600, padding: "3px 10px",
      borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase",
    }}>{children}</span>
  );
};

const Spinner = () => (
  <div style={{
    width: 20, height: 20, border: "2px solid var(--border)",
    borderTop: "2px solid var(--gold)", borderRadius: "50%",
    animation: "spin 0.8s linear infinite", display: "inline-block",
  }} />
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const { user, logout } = useAuth();
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: 64,
    }}>
      <div onClick={() => setPage("catalogue")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22, color: "var(--gold)" }}>◈</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 3 }}>CineVault</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {user ? (
          <>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {user.role === "ADMIN" ? "⚡ " : "👤 "}{user.name}
            </span>
            <Badge color={user.role === "ADMIN" ? "gold" : "accent"}>{user.role}</Badge>
            <Btn variant="ghost" small onClick={() => { logout(); setPage("catalogue"); }}>Sign Out</Btn>
          </>
        ) : (
          <Btn variant="primary" small onClick={() => setPage("auth")}>Sign Up / Login</Btn>
        )}
      </div>
    </nav>
  );
};

// ─── Movie Card ───────────────────────────────────────────────────────────────
const MovieCard = ({ movie, onClick, showAdmin, onDelete }) => (
  <div
    onClick={onClick}
    style={{
      position: "relative", borderRadius: 16, overflow: "hidden",
      background: "var(--surface)", border: "1px solid var(--border)",
      cursor: "pointer", transition: "all 0.3s",
      animation: "fadeUp 0.4s ease both",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
      e.currentTarget.style.borderColor = "var(--gold)";
      e.currentTarget.style.boxShadow = "0 12px 40px rgba(212,168,67,0.2)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
    }}
  >
    <div style={{ position: "relative", height: 240, overflow: "hidden", background: "var(--surface2)" }}>
      {movie.posterUrl ? (
        <img src={movie.posterUrl} alt={movie.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.style.display = "none"; }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🎬</div>
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.2) 60%, transparent 100%)",
      }} />
      <div style={{ position: "absolute", top: 12, right: 12 }}>
        <Badge color="gold">{movie.genre}</Badge>
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1, lineHeight: 1.1 }}>{movie.title}</div>
        <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{movie.releaseYear}</div>
      </div>
    </div>
    <div style={{ padding: "12px 14px" }}>
      <p style={{
        color: "var(--text-muted)", fontSize: 12, marginTop: 6, lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>{movie.description}</p>
      {showAdmin && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }} onClick={e => e.stopPropagation()}>
          <Btn variant="accent" small onClick={onClick}>Edit</Btn>
          <Btn variant="danger" small onClick={() => onDelete(movie.id)}>Delete</Btn>
        </div>
      )}
    </div>
  </div>
);

// ─── Movie Detail Modal ───────────────────────────────────────────────────────
const MovieModal = ({ movie, onClose, isAdmin, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: movie.title || "",
    description: movie.description || "",
    genreName: movie.genre || "",
    castNames: Array.isArray(movie.cast) ? movie.cast : [],
    castTypeName: movie.castType || "",
    directorName: movie.director || "",
    producerName: movie.producer || "",
    posterUrl: movie.posterUrl || "",
    releaseYear: movie.releaseYear || "",
  });

  if (!movie) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(movie.id, form);
      setEditing(false);
    } catch (e) {
      alert("Update failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const Label = ({ children }) => (
    <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>{children}</label>
  );

  const Field = ({ label, field, multiline }) => (
    <div style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      {editing
        ? multiline
          ? <textarea rows={3} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
          : <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
        : <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6 }}>
            {Array.isArray(movie[field]) ? movie[field].join(", ") : (movie[field] || "—")}
          </p>
      }
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 20, maxWidth: 860, width: "100%",
        maxHeight: "90vh", overflow: "auto", animation: "fadeUp 0.3s ease",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ width: 280, flexShrink: 0, position: "relative", background: "var(--surface2)" }}>
            {movie.posterUrl
              ? <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", height: "100%", minHeight: 360, objectFit: "cover", borderRadius: "20px 0 0 20px" }} onError={e => e.target.style.display = "none"} />
              : <div style={{ width: "100%", minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, borderRadius: "20px 0 0 20px" }}>🎬</div>
            }
          </div>
          <div style={{ flex: 1, padding: 32, minWidth: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                {editing
                  ? <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2 }} />
                  : <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2 }}>{movie.title}</h2>
                }
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <Badge color="gold">{movie.genre}</Badge>
                  {movie.releaseYear && <Badge color="accent">{movie.releaseYear}</Badge>}
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 24, cursor: "pointer" }}>✕</button>
            </div>

            <Field label="Description" field="description" multiline />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <Field label="Director" field="director" />
              <Field label="Producer" field="producer" />
              <Field label="Cast" field="cast" />
              <Field label="Cast Type" field="castType" />
            </div>

            {isAdmin && (
              <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                {editing ? (
                  <>
                    <Btn variant="success" onClick={handleSave} disabled={saving}>
                      {saving ? <Spinner /> : "💾 Save Changes"}
                    </Btn>
                    <Btn variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
                  </>
                ) : (
                  <>
                    <Btn variant="accent" onClick={() => setEditing(true)}>✏️ Update</Btn>
                    <Btn variant="danger" onClick={() => { onDelete(movie.id); onClose(); }}>🗑️ Delete</Btn>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Add Movie Modal ──────────────────────────────────────────────────────────
const AddMovieModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    title: "", description: "", genreName: "Action",
    castNames: "", castTypeName: "Lead",
    directorName: "", producerName: "",
    posterUrl: "", releaseYear: 2024,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.title || !form.description) { setError("Title and description are required."); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        castNames: form.castNames ? form.castNames.split(",").map(s => s.trim()).filter(Boolean) : [],
        releaseYear: parseInt(form.releaseYear),
      };
      await onAdd(payload);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ children }) => (
    <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5 }}>{children}</label>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--gold)",
        borderRadius: 20, maxWidth: 600, width: "100%", padding: 36,
        maxHeight: "90vh", overflow: "auto", animation: "fadeUp 0.3s ease",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2, color: "var(--gold)" }}>Add New Movie</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div><Label>Title *</Label><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Movie title" /></div>
          <div><Label>Description *</Label><textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Synopsis..." /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><Label>Genre</Label>
              <select value={form.genreName} onChange={e => set("genreName", e.target.value)}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><Label>Year</Label><input type="number" value={form.releaseYear} onChange={e => set("releaseYear", e.target.value)} /></div>
            <div><Label>Director</Label><input value={form.directorName} onChange={e => set("directorName", e.target.value)} placeholder="Director name" /></div>
            <div><Label>Producer</Label><input value={form.producerName} onChange={e => set("producerName", e.target.value)} placeholder="Producer name" /></div>
            <div><Label>Cast (comma separated)</Label><input value={form.castNames} onChange={e => set("castNames", e.target.value)} placeholder="Actor 1, Actor 2" /></div>
            <div><Label>Cast Type</Label>
              <select value={form.castTypeName} onChange={e => set("castTypeName", e.target.value)}>
                {["Lead", "Ensemble", "Supporting", "Cameo"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}><Label>Poster URL</Label><input value={form.posterUrl} onChange={e => set("posterUrl", e.target.value)} placeholder="https://..." /></div>
          </div>
        </div>
        {error && <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "var(--red-dim)", color: "var(--red)", fontSize: 13 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Btn variant="primary" onClick={handleAdd} disabled={loading}>{loading ? <Spinner /> : "✚ Add Movie"}</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── Catalogue Page ───────────────────────────────────────────────────────────
const CataloguePage = ({ movies, setPage, loading }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const top5 = movies.slice(0, 5);

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      <div style={{
        position: "relative", height: 420,
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a20 50%, #0a0f1a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(212,168,67,0.5) 40px,rgba(212,168,67,0.5) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(212,168,67,0.5) 40px,rgba(212,168,67,0.5) 41px)" }} />
        <div style={{ textAlign: "center", position: "relative", animation: "fadeUp 0.6s ease" }}>
          <p style={{ color: "var(--gold)", fontSize: 12, letterSpacing: 6, textTransform: "uppercase", marginBottom: 16 }}>Welcome to</p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(60px,10vw,120px)", letterSpacing: 8, lineHeight: 0.9, background: "linear-gradient(135deg, #f0ede8 30%, var(--gold))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CineVault</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginTop: 20, maxWidth: 400 }}>Your curated cinematic universe. Discover, explore, and indulge.</p>
          {!user
            ? <Btn style={{ marginTop: 28 }} onClick={() => setPage("auth")}>🎬 Get Started</Btn>
            : <Btn style={{ marginTop: 28 }} onClick={() => setPage(user.role === "ADMIN" ? "admin" : "user")}>
                {user.role === "ADMIN" ? "⚡ Admin Panel" : "🎬 Browse All Movies"}
              </Btn>
          }
        </div>
      </div>

      <div style={{ padding: "60px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <span style={{ color: "var(--gold)", fontSize: 28 }}>◈</span>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2 }}>Top 5 Picks</h2>
          <div style={{ flex: 1, height: 1, background: "var(--border)", marginLeft: 10 }} />
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}><Spinner /></div>
        ) : top5.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <p>No movies yet. Admin will add some soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
            {top5.map((m, i) => (
              <div key={m.id} style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: -10, left: -8, zIndex: 2, fontFamily: "'Bebas Neue'", fontSize: 52, lineHeight: 1, color: "var(--gold)", opacity: 0.25 }}>#{i + 1}</div>
                <MovieCard movie={m} onClick={() => setSelected(m)} />
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} isAdmin={false} />}
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const AuthPage = ({ setPage }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
      } else {
        if (!form.name) { setError("Name is required."); setLoading(false); return; }
        res = await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
      }
      const userData = res.data;
      localStorage.setItem("cv_token", userData.token);
      localStorage.setItem("cv_user", JSON.stringify(userData));
      login(userData);
      setPage(userData.role === "ADMIN" ? "admin" : "user");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at center, #1a0f30 0%, #0a0a0f 70%)" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: "48px 44px", width: "100%", maxWidth: 440, animation: "fadeUp 0.4s ease", boxShadow: "0 20px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 32, color: "var(--gold)" }}>◈</span>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 3, marginTop: 8 }}>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{isLogin ? "Sign in to your CineVault account" : "Join the CineVault community"}</p>
        </div>

        <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {["Login", "Sign Up"].map((t, i) => (
            <button key={t} onClick={() => { setIsLogin(i === 0); setError(""); }}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 14, transition: "all 0.2s", background: isLogin === (i === 0) ? "var(--gold)" : "transparent", color: isLogin === (i === 0) ? "#0a0a0f" : "var(--text-muted)" }}>{t}</button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label>
              <input placeholder="Your name" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}>
                <option value="USER">User — Browse movies</option>
                <option value="ADMIN">Admin — Manage movies</option>
              </select>
            </div>
          )}
        </div>

        {error && <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "var(--red-dim)", color: "var(--red)", fontSize: 13 }}>{error}</div>}

        <Btn style={{ width: "100%", marginTop: 24, justifyContent: "center" }} onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner /> : (isLogin ? "Sign In →" : "Create Account →")}
        </Btn>

        <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--surface2)", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Demo credentials:</p>
          <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Admin: admin@cinevault.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

// ─── User Page ────────────────────────────────────────────────────────────────
const UserPage = ({ movies, loading }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");

  const filtered = movies.filter(m =>
    (genre === "All" || m.genre === genre) &&
    m.title.toLowerCase().includes(search.toLowerCase())
  );
  const allGenres = ["All", ...new Set(movies.map(m => m.genre).filter(Boolean))];

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      <div style={{ padding: "40px 40px 0", borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: 4, textTransform: "uppercase" }}>Hello, {user?.name}</p>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3, marginTop: 4 }}>All Movies</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 24 }}>{movies.length} titles in the vault</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingBottom: 24 }}>
          <input placeholder="🔍  Search movies..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allGenres.map(g => (
              <button key={g} onClick={() => setGenre(g)} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid", borderColor: genre === g ? "var(--gold)" : "var(--border)", background: genre === g ? "var(--gold-dim)" : "transparent", color: genre === g ? "var(--gold)" : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'", fontWeight: 500, transition: "all 0.2s" }}>{g}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 40px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <p>No movies found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
            {filtered.map(m => <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} />)}
          </div>
        )}
      </div>
      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} isAdmin={false} />}
    </div>
  );
};

// ─── Admin Page ───────────────────────────────────────────────────────────────
const AdminPage = ({ movies, setMovies, loading, stats }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (payload) => {
    const res = await api("/movies", { method: "POST", body: JSON.stringify(payload) });
    setMovies(prev => [res.data, ...prev]);
  };

  const handleUpdate = async (id, payload) => {
    const res = await api(`/movies/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    setMovies(prev => prev.map(m => m.id === id ? res.data : m));
    setSelected(res.data);
  };

  const handleDelete = async (id) => {
    await api(`/movies/${id}`, { method: "DELETE" });
    setMovies(prev => prev.filter(m => m.id !== id));
    setSelected(null);
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 32, fontFamily: "'Bebas Neue'", letterSpacing: 2, color }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      <div style={{ padding: "40px 40px 0" }}>
        <p style={{ color: "var(--gold)", fontSize: 12, letterSpacing: 4, textTransform: "uppercase" }}>⚡ Admin Panel</p>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3, marginTop: 4 }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Welcome back, {user?.name}</p>
      </div>

      <div style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
        <StatCard icon="👥" label="Total Users"    value={stats?.totalUsers   ?? "—"} color="var(--accent)" />
        <StatCard icon="🎬" label="Movies in Vault" value={stats?.totalMovies  ?? "—"} color="var(--gold)" />
        <StatCard icon="🎭" label="Genres Covered"  value={stats?.totalGenres  ?? "—"} color="var(--success)" />
        <StatCard icon="🎬" label="Directors"        value={stats?.totalDirectors ?? "—"} color="var(--red)" />
      </div>

      <div style={{ padding: "0 40px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2 }}>Movie Catalogue</h2>
          <div style={{ flex: 1 }} />
          <input placeholder="🔍  Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          <Btn variant="primary" onClick={() => setShowAdd(true)}>✚ Add Movie</Btn>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>No movies yet. Add your first movie!</p>
            <Btn style={{ marginTop: 20 }} onClick={() => setShowAdd(true)}>✚ Add Movie</Btn>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
            {filtered.map(m => (
              <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} showAdmin onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} isAdmin onUpdate={handleUpdate} onDelete={handleDelete} />}
      {showAdd && <AddMovieModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("cv_user")); } catch { return null; }
  });
  const [page, setPage]     = useState("catalogue");
  const [movies, setMovies] = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);

  // Inject global styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Load movies from backend
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api("/movies");
      setMovies(res.data || []);
    } catch (e) {
      console.error("Failed to load movies:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load admin stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api("/admin/stats");
      setStats(res.data);
    } catch (e) {
      console.error("Failed to load stats:", e.message);
    }
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);
  useEffect(() => { if (user?.role === "ADMIN") fetchStats(); }, [user, fetchStats]);

  const auth = {
    user,
    login: (u) => setUser(u),
    logout: () => {
      localStorage.removeItem("cv_token");
      localStorage.removeItem("cv_user");
      setUser(null);
    },
  };

  const renderPage = () => {
    switch (page) {
      case "catalogue": return <CataloguePage movies={movies} setPage={setPage} loading={loading} />;
      case "auth":      return <AuthPage setPage={setPage} />;
      case "user":
        if (!user || user.role !== "USER") { setPage("auth"); return null; }
        return <UserPage movies={movies} loading={loading} />;
      case "admin":
        if (!user || user.role !== "ADMIN") { setPage("auth"); return null; }
        return <AdminPage movies={movies} setMovies={setMovies} loading={loading} stats={stats} />;
      default: return <CataloguePage movies={movies} setPage={setPage} loading={loading} />;
    }
  };

  return (
    <AuthContext.Provider value={auth}>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar page={page} setPage={setPage} />
        {renderPage()}
      </div>
    </AuthContext.Provider>
  );
}
