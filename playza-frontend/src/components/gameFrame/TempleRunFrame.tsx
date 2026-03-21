import { useEffect } from "react";

// export default function TempleRunFrame({ gameId, sessionId }) {
export default function TempleRunFrame() {
  // const iframeSrc = `/games/temple-rush/index.html?session=${sessionId}`;
  const iframeSrc = "/gamesLib/temple-run/templeRun.html";

  // useEffect(() => {
  //   const handleMessage = (event) => {
  //     // 🔒 Validate event.origin in production!
  //     if (event.data?.type === "PLAYZA_SCORE_SUBMIT") {
  //       // Forward to your backend
  //       fetch("/api/leaderboard/submit", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(event.data),
  //       });
  //     }
  //   };

  //   window.addEventListener("message", handleMessage);
  //   return () => window.removeEventListener("message", handleMessage);
  // }, []);

  return (
    <>
      <iframe
        src={iframeSrc}
        sandbox="allow-scripts allow-same-origin allow-pointer-lock"
        className="w-full h-125 border-0"
        title="Temple Rush Game"
      />
    </>
  );
}
