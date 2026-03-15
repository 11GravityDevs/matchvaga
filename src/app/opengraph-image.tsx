import { ImageResponse } from "next/og";

export const alt =
  "MatchVaga - Adapte seu currículo para cada vaga em segundos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          MatchVaga
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Adapte seu currículo para cada vaga em segundos
        </div>
        <div
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.75)",
            marginTop: 8,
          }}
        >
          Plataforma #1 para candidatos no Brasil
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
