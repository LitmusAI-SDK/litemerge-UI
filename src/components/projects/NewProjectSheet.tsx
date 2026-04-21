import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { createProject, patchProject } from "../../lib/api/projects";
import type { Project } from "../../types/api";

interface NewProjectSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editProject?: Project | null;
}

export default function NewProjectSheet({ open, onClose, onSaved, editProject }: NewProjectSheetProps) {
  const { token } = useAuth();
  const isEdit = !!editProject;

  const [name, setName] = useState(editProject?.name ?? "");
  const [endpoint, setEndpoint] = useState(editProject?.agent_endpoint ?? "");
  const [authType, setAuthType] = useState<"bearer" | "apikey" | "basic" | "none">(
    editProject?.auth_config.type ?? "none"
  );
  const [authValue, setAuthValue] = useState("");
  const [headerName, setHeaderName] = useState(editProject?.auth_config.header_name ?? "X-Api-Key");
  const [companyContext, setCompanyContext] = useState(editProject?.company_context ?? "");
  const [maxMessageChars, setMaxMessageChars] = useState<string>(
    editProject?.max_message_chars != null ? String(editProject.max_message_chars) : ""
  );
  const [schemaOpen, setSchemaOpen] = useState(
    (editProject?.schema_hints?.caller_type === "directline" || editProject?.schema_hints?.caller_type === "tmobile") ||
    !!(editProject?.schema_hints?.message || editProject?.schema_hints?.reply)
  );
  const [schemaMessage, setSchemaMessage] = useState(editProject?.schema_hints?.message ?? "");
  const [schemaReply, setSchemaReply] = useState(editProject?.schema_hints?.reply ?? "");
  const [callerType, setCallerType] = useState<"standard" | "directline" | "tmobile">(
    (editProject?.schema_hints?.caller_type as "standard" | "directline" | "tmobile") ?? "standard"
  );
  const [dlConversationId, setDlConversationId] = useState(
    editProject?.schema_hints?.directline_conversation_id ?? ""
  );
  const [tmConversationId, setTmConversationId] = useState(editProject?.schema_hints?.tmobile_conversation_id ?? "");
  const [tmSessionId, setTmSessionId] = useState(editProject?.schema_hints?.tmobile_session_id ?? "");
  const [tmInteractionId, setTmInteractionId] = useState(editProject?.schema_hints?.tmobile_interaction_id ?? "");
  const [tmWorkflowId, setTmWorkflowId] = useState(editProject?.schema_hints?.tmobile_workflow_id ?? "UPGRADE");
  const [tmSubWorkflowId, setTmSubWorkflowId] = useState(editProject?.schema_hints?.tmobile_sub_workflow_id ?? "Contact Us");
  const [tmXAuthOriginator, setTmXAuthOriginator] = useState(editProject?.schema_hints?.tmobile_x_auth_originator ?? "");
  const [previousAuthType, setPreviousAuthType] = useState<"bearer" | "apikey" | "basic" | "none">(
    editProject?.auth_config.type ?? "none"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(editProject?.name ?? "");
    setEndpoint(editProject?.agent_endpoint ?? "");
    setAuthType(editProject?.auth_config?.type ?? "none");
    setAuthValue("");
    setHeaderName(editProject?.auth_config?.header_name ?? "X-Api-Key");
    setCompanyContext(editProject?.company_context ?? "");
    setMaxMessageChars(editProject?.max_message_chars != null ? String(editProject.max_message_chars) : "");
    setSchemaOpen(
      (editProject?.schema_hints?.caller_type === "directline" || editProject?.schema_hints?.caller_type === "tmobile") ||
      !!(editProject?.schema_hints?.message || editProject?.schema_hints?.reply)
    );
    setSchemaMessage(editProject?.schema_hints?.message ?? "");
    setSchemaReply(editProject?.schema_hints?.reply ?? "");
    setCallerType((editProject?.schema_hints?.caller_type as "standard" | "directline" | "tmobile") ?? "standard");
    setDlConversationId(editProject?.schema_hints?.directline_conversation_id ?? "");
    setTmConversationId(editProject?.schema_hints?.tmobile_conversation_id ?? "");
    setTmSessionId(editProject?.schema_hints?.tmobile_session_id ?? "");
    setTmInteractionId(editProject?.schema_hints?.tmobile_interaction_id ?? "");
    setTmWorkflowId(editProject?.schema_hints?.tmobile_workflow_id ?? "UPGRADE");
    setTmSubWorkflowId(editProject?.schema_hints?.tmobile_sub_workflow_id ?? "Contact Us");
    setTmXAuthOriginator(editProject?.schema_hints?.tmobile_x_auth_originator ?? "");
    setPreviousAuthType(editProject?.auth_config?.type ?? "none");
    setError(null);
  }, [open, editProject]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);

    try {
      const auth_config: Record<string, string> = { type: authType };
      if (authType !== "none" && authValue) auth_config.value = authValue;
      if (authType === "apikey") auth_config.header_name = headerName;

      const schema_hints: Record<string, string> = {};
      if (schemaMessage) schema_hints.message = schemaMessage;
      if (schemaReply) schema_hints.reply = schemaReply;
      if (callerType === "directline") {
        schema_hints.caller_type = "directline";
        if (dlConversationId) schema_hints.directline_conversation_id = dlConversationId;
      } else if (callerType === "tmobile") {
        schema_hints.caller_type = "tmobile";
        if (tmConversationId) schema_hints.tmobile_conversation_id = tmConversationId;
        if (tmSessionId) schema_hints.tmobile_session_id = tmSessionId;
        if (tmInteractionId) schema_hints.tmobile_interaction_id = tmInteractionId;
        if (tmWorkflowId) schema_hints.tmobile_workflow_id = tmWorkflowId;
        if (tmSubWorkflowId) schema_hints.tmobile_sub_workflow_id = tmSubWorkflowId;
        if (tmXAuthOriginator) schema_hints.tmobile_x_auth_originator = tmXAuthOriginator;
      }

      const payload = {
        name,
        agent_endpoint: endpoint,
        owner_id: "dashboard",
        auth_config: auth_config as Parameters<typeof createProject>[0]["auth_config"],
        ...(Object.keys(schema_hints).length ? { schema_hints } : {}),
        ...(companyContext.trim() ? { company_context: companyContext.trim() } : {}),
        ...(maxMessageChars ? { max_message_chars: parseInt(maxMessageChars, 10) } : {}),
      };

      if (isEdit && editProject) {
        await patchProject(editProject.id, payload, token);
      } else {
        await createProject(payload, token);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: "#171f33",
    border: "1px solid rgba(66,71,84,0.2)",
    color: "#dae2fd",
    outline: "none",
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.target.style.borderColor = "#adc6ff";
      e.target.style.boxShadow = "0 0 0 1px #adc6ff";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.target.style.borderColor = "rgba(66,71,84,0.2)";
      e.target.style.boxShadow = "none";
    },
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(6,14,32,0.8)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-xl h-screen flex flex-col"
        style={{ backgroundColor: "#131b2e", boxShadow: "-24px 0 48px rgba(6,14,32,0.5)", borderLeft: "1px solid rgba(66,71,84,0.1)" }}
      >
        {/* Header */}
        <div className="p-8 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(66,71,84,0.1)" }}>
          <div>
            <h3 className="text-2xl font-space-grotesk font-bold" style={{ color: "#dae2fd" }}>
              {isEdit ? "Edit Project" : "Create New Project"}
            </h3>
            <p className="text-sm mt-1" style={{ color: "#8c909f" }}>
              Configure an observational instance for behavioral testing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-[#2d3449]"
            style={{ color: "#8c909f" }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* General */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#adc6ff" }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Behavioral Synthesis V4"
                  required
                  className="w-full p-4 rounded-lg font-medium text-sm transition-all"
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#adc6ff" }}>
                  Agent Endpoint URL
                </label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.agent-cloud.io/v1/inference"
                  required
                  className="w-full px-4 py-4 rounded-lg font-mono text-sm transition-all"
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#adc6ff" }}>
                  Company & Agent Context
                </label>
                <p className="text-xs" style={{ color: "#8c909f" }}>
                  Describe the company and what the agent does. Personas will tailor their
                  scenarios to this context.
                </p>
                <textarea
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  placeholder={`e.g. Air India is India's national flag carrier. The agent handles flight booking, cancellations, baggage queries, Flying Returns loyalty programme questions, and check-in assistance.`}
                  rows={4}
                  maxLength={2000}
                  className="w-full p-4 rounded-lg text-sm transition-all resize-none"
                  style={{ ...inputStyle, lineHeight: "1.6" }}
                  onFocus={(e) => { e.target.style.borderColor = "#adc6ff"; e.target.style.boxShadow = "0 0 0 1px #adc6ff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(66,71,84,0.2)"; e.target.style.boxShadow = "none"; }}
                />
                <p className="text-xs text-right" style={{ color: "#4a5568" }}>
                  {companyContext.length} / 2000
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#adc6ff" }}>
                  Message Character Limit
                </label>
                <p className="text-xs" style={{ color: "#8c909f" }}>
                  Max characters per persona message. Set this to your agent's input cap
                  (e.g. 500). Leave blank for no limit.
                </p>
                <input
                  type="number"
                  value={maxMessageChars}
                  onChange={(e) => setMaxMessageChars(e.target.value)}
                  placeholder="500"
                  min={50}
                  max={10000}
                  className="w-full p-4 rounded-lg font-mono text-sm transition-all"
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
            </div>

            {/* Authentication */}
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#adc6ff" }}>
                  Authentication Method
                </label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value as typeof authType)}
                  className="w-full p-4 rounded-lg font-medium transition-all appearance-none cursor-pointer"
                  style={inputStyle}
                  {...focusHandlers}
                >
                  <option value="none">None</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="apikey">API Key</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>

              {authType !== "none" && (
                <div className="grid grid-cols-2 gap-4">
                  {authType === "apikey" && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#d0bcff" }}>
                        Header Name
                      </label>
                      <input
                        type="text"
                        value={headerName}
                        onChange={(e) => setHeaderName(e.target.value)}
                        className="w-full p-4 rounded-lg font-mono text-sm transition-all"
                        style={inputStyle}
                        {...focusHandlers}
                      />
                    </div>
                  )}
                  <div className={authType === "apikey" ? "space-y-2" : "col-span-2 space-y-2"}>
                    <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#d0bcff" }}>
                      {authType === "bearer" ? "Bearer Token" : authType === "basic" ? "Credentials (user:pass)" : "API Key"}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={authValue}
                        onChange={(e) => setAuthValue(e.target.value)}
                        placeholder={isEdit && editProject?.auth_config.has_value ? "••••• (unchanged)" : "Enter secret"}
                        className="w-full p-4 rounded-lg font-mono text-sm transition-all"
                        style={inputStyle}
                        {...focusHandlers}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schema Hints Accordion */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setSchemaOpen((v) => !v)}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-[#31394d] group"
                style={{ backgroundColor: "#2d3449" }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: "#d0bcff" }}>settings_input_component</span>
                  <span className="text-sm font-bold tracking-tight uppercase" style={{ color: "#dae2fd" }}>
                    Advanced: Schema Hints
                  </span>
                </div>
                <span
                  className="material-symbols-outlined transition-transform"
                  style={{ color: "#8c909f", transform: schemaOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  expand_more
                </span>
              </button>

              {schemaOpen && (
                <div className="mt-4 space-y-4 px-1">
                  {/* Caller Protocol */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold" style={{ color: "#64748b" }}>
                      CALLER_PROTOCOL
                    </label>
                    <select
                      value={callerType}
                      onChange={(e) => {
                        const v = e.target.value as "standard" | "directline" | "tmobile";
                        setCallerType(v);
                        if (v === "directline" || v === "tmobile") {
                          setPreviousAuthType(authType);
                          setAuthType("bearer");
                        } else {
                          setAuthType(previousAuthType);
                        }
                      }}
                      className="w-full p-3 rounded-lg font-mono text-sm transition-all appearance-none cursor-pointer"
                      style={inputStyle}
                      {...focusHandlers}
                    >
                      <option value="standard">Standard HTTP (default)</option>
                      <option value="directline">Microsoft DirectLine v3</option>
                      <option value="tmobile">T-Mobile InfoBot</option>
                    </select>
                  </div>

                  {/* DirectLine fields */}
                  {callerType === "directline" && (
                    <>
                      <div
                        className="flex gap-3 p-3 rounded-lg text-xs"
                        style={{ backgroundColor: "rgba(173,198,255,0.06)", border: "1px solid rgba(173,198,255,0.15)", color: "#8c909f" }}
                      >
                        <span className="material-symbols-outlined text-base shrink-0" style={{ color: "#adc6ff" }}>info</span>
                        <span>
                          Set <span className="font-mono" style={{ color: "#dae2fd" }}>Agent Endpoint</span> to
                          {" "}<span className="font-mono" style={{ color: "#dae2fd" }}>https://directline.botframework.com</span>.
                          <br /><br />
                          <span style={{ color: "#dae2fd" }}>Mode A — channel secret:</span> leave Conversation ID blank. Use Bearer Token auth with your long-lived channel secret.
                          <br /><br />
                          <span style={{ color: "#dae2fd" }}>Mode B — captured token (e.g. Air India):</span> paste the <span className="font-mono">conversationId</span> and the short-lived Bearer token from the widget's network requests. Token expires in ~1h; re-capture when it does.
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold" style={{ color: "#64748b" }}>
                          DIRECTLINE_CONVERSATION_ID <span style={{ color: "#4a5568" }}>(optional — Mode B only)</span>
                        </label>
                        <input
                          type="text"
                          value={dlConversationId}
                          onChange={(e) => setDlConversationId(e.target.value)}
                          placeholder="8Eit97xYyej8cVpb0bCUpU-in"
                          className="w-full p-3 rounded-lg font-mono text-sm transition-all"
                          style={inputStyle}
                          {...focusHandlers}
                        />
                      </div>
                    </>
                  )}

                  {/* T-Mobile fields */}
                  {callerType === "tmobile" && (
                    <>
                      <div
                        className="flex gap-3 p-3 rounded-lg text-xs"
                        style={{ backgroundColor: "rgba(173,198,255,0.06)", border: "1px solid rgba(173,198,255,0.15)", color: "#8c909f" }}
                      >
                        <span className="material-symbols-outlined text-base shrink-0" style={{ color: "#adc6ff" }}>info</span>
                        <span>
                          Capture these values from a real browser session on the T-Mobile chat page (DevTools → Network → copy as cURL). Tokens expire — re-capture when the bot stops responding.
                        </span>
                      </div>
                      {[
                        { label: "CONVERSATION_ID", value: tmConversationId, set: setTmConversationId, placeholder: "253e4eb2-9cbd-41aa-bc9c-..." },
                        { label: "SESSION_ID", value: tmSessionId, set: setTmSessionId, placeholder: "18ae581a-0827-42f3-8440-..." },
                        { label: "INTERACTION_ID", value: tmInteractionId, set: setTmInteractionId, placeholder: "097ebb03-fdde-454b-89bb-..." },
                        { label: "WORKFLOW_ID", value: tmWorkflowId, set: setTmWorkflowId, placeholder: "UPGRADE" },
                        { label: "SUB_WORKFLOW_ID", value: tmSubWorkflowId, set: setTmSubWorkflowId, placeholder: "Contact Us" },
                        { label: "X_AUTH_ORIGINATOR (JWT)", value: tmXAuthOriginator, set: setTmXAuthOriginator, placeholder: "eyJraWQi..." },
                      ].map(({ label, value, set, placeholder }) => (
                        <div key={label} className="space-y-2">
                          <label className="text-xs font-mono font-bold" style={{ color: "#64748b" }}>{label}</label>
                          <input
                            type={label.includes("JWT") || label.includes("AUTH") ? "password" : "text"}
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            placeholder={placeholder}
                            className="w-full p-3 rounded-lg font-mono text-sm transition-all"
                            style={inputStyle}
                            {...focusHandlers}
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {/* Standard-only fields */}
                  {callerType === "standard" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold" style={{ color: "#64748b" }}>
                          MESSAGE_FIELD_NAME
                        </label>
                        <input
                          type="text"
                          value={schemaMessage}
                          onChange={(e) => setSchemaMessage(e.target.value)}
                          placeholder="input_text"
                          className="w-full p-3 rounded-lg font-mono text-sm transition-all"
                          style={inputStyle}
                          {...focusHandlers}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold" style={{ color: "#64748b" }}>
                          REPLY_FIELD_NAME
                        </label>
                        <input
                          type="text"
                          value={schemaReply}
                          onChange={(e) => setSchemaReply(e.target.value)}
                          placeholder="response.output"
                          className="w-full p-3 rounded-lg font-mono text-sm transition-all"
                          style={inputStyle}
                          {...focusHandlers}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p>
            )}
          </div>

          {/* Footer */}
          <div
            className="p-8 flex gap-4 glass-panel"
            style={{ borderTop: "1px solid rgba(66,71,84,0.1)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-lg font-bold transition-colors hover:bg-[#adc6ff]/10"
              style={{ color: "#adc6ff" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #adc6ff, #4d8eff)",
                color: "#002e6a",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 16px rgba(173,198,255,0.2)",
              }}
            >
              <span className="material-symbols-outlined text-lg">save</span>
              {loading ? "Saving…" : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
