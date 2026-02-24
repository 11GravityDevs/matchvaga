import { ImageResponse } from "next/og";

export const alt =
  "MatchVaga - Chega de perder tempo com candidaturas. Plataforma #1 para candidatos no Brasil.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fafafa 0%, #f8fafc 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 80,
          height: 80,
          borderRadius: 16,
          backgroundColor: "#2563eb",
          marginBottom: 32,
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 18v-6" />
          <path d="M9 15h6" />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#0a0a0a",
            letterSpacing: "-0.02em",
          }}
        >
          Match<span style={{ color: "#2563eb" }}>Vaga</span>
        </span>
        <span
          style={{
            fontSize: 28,
            color: "#737373",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Chega de perder tempo com candidaturas
        </span>
        <span
          style={{
            fontSize: 18,
            color: "#2563eb",
            fontWeight: 600,
            marginTop: 8,
          }}
        >
          Plataforma #1 para candidatos no Brasil
        </span>
      </div>
    </div>,
    { ...size }
  );
}
