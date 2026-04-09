import { useParams } from "react-router-dom";

export default function ReportView() {
  const { runId } = useParams();
  return (
    <div className="p-8">
      <p className="text-sm font-mono" style={{ color: "#adc6ff" }}>
        Report for run: {runId}
      </p>
      <p className="text-sm mt-2" style={{ color: "#8c909f" }}>
        Session D — full report view coming next.
      </p>
    </div>
  );
}
