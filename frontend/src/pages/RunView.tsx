import { useParams } from "react-router-dom";

export default function RunView() {
  const { runId } = useParams();
  return (
    <div className="p-8">
      <p className="text-sm font-mono" style={{ color: "#adc6ff" }}>
        Run: {runId}
      </p>
      <p className="text-sm mt-2" style={{ color: "#8c909f" }}>
        Session C — live simulation canvas coming next.
      </p>
    </div>
  );
}
