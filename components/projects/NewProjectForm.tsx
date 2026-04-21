'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { createProject, patchProject } from '@/lib/api/projects';
import type { Project, AuthConfigInput } from '@/types/api';

interface NewProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProject?: Project | null;
  onSuccess: () => void;
}

type AuthType = 'none' | 'bearer' | 'apikey' | 'basic';

type CallerProtocol = 'standard' | 'directline' | 'tmobile';

interface FormState {
  name: string;
  endpoint: string;
  authType: AuthType;
  authValue: string;
  authHeader: string;
  authUsername: string;
  authPassword: string;
  callerProtocol: CallerProtocol;
  schemaMessage: string;
  schemaReply: string;
  schemaSessionId: string;
  schemaHistory: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  endpoint: '',
  authType: 'none',
  authValue: '',
  authHeader: 'X-Api-Key',
  authUsername: '',
  authPassword: '',
  callerProtocol: 'standard',
  schemaMessage: '',
  schemaReply: '',
  schemaSessionId: '',
  schemaHistory: '',
};

interface FieldError {
  name?: string;
  endpoint?: string;
  authValue?: string;
  authUsername?: string;
  authPassword?: string;
}

function validate(form: FormState): FieldError {
  const errors: FieldError = {};
  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  try {
    new URL(form.endpoint);
  } catch {
    errors.endpoint = 'Must be a valid URL (include https://)';
  }
  if (form.authType === 'bearer' || form.authType === 'apikey') {
    if (!form.authValue.trim()) errors.authValue = 'Token / API key is required';
  }
  if (form.authType === 'basic') {
    if (!form.authUsername.trim()) errors.authUsername = 'Username is required';
    if (!form.authPassword.trim()) errors.authPassword = 'Password is required';
  }
  return errors;
}

export default function NewProjectForm({
  open,
  onOpenChange,
  editProject,
  onSuccess,
}: NewProjectFormProps) {
  const isEdit = !!editProject;

  function getInitialForm(): FormState {
    if (!editProject) return EMPTY_FORM;
    const callerType = editProject.schema_hints?.caller_type as CallerProtocol | undefined;
    return {
      ...EMPTY_FORM,
      name: editProject.name,
      endpoint: editProject.agent_endpoint,
      authType: editProject.auth_config.type as AuthType,
      authHeader: editProject.auth_config.header_name ?? 'X-Api-Key',
      callerProtocol: callerType ?? 'standard',
      schemaMessage: editProject.schema_hints?.message ?? '',
      schemaReply: editProject.schema_hints?.reply ?? '',
      schemaSessionId: editProject.schema_hints?.session_id ?? '',
      schemaHistory: editProject.schema_hints?.conversation_history ?? '',
    };
  }

  const [form, setForm] = useState<FormState>(getInitialForm);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  // Re-init when editProject changes
  function handleOpenChange(val: boolean) {
    if (val) setForm(getInitialForm());
    setErrors({});
    onOpenChange(val);
  }

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FieldError]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const authConfig: AuthConfigInput = { type: form.authType };
    if (form.authType === 'bearer') authConfig.value = form.authValue;
    if (form.authType === 'apikey') {
      authConfig.value = form.authValue;
      authConfig.header_name = form.authHeader;
    }
    if (form.authType === 'basic') {
      authConfig.username = form.authUsername;
      authConfig.password = form.authPassword;
    }

    const hasSchemaFields =
      form.callerProtocol !== 'standard' ||
      form.schemaMessage ||
      form.schemaReply ||
      form.schemaSessionId ||
      form.schemaHistory;
    const schemaHints = hasSchemaFields
      ? {
          caller_type: form.callerProtocol !== 'standard' ? form.callerProtocol : undefined,
          message: form.schemaMessage || undefined,
          reply: form.schemaReply || undefined,
          session_id: form.schemaSessionId || undefined,
          conversation_history: form.schemaHistory || undefined,
        }
      : null;

    setLoading(true);
    try {
      if (isEdit) {
        await patchProject(editProject!.id, {
          name: form.name,
          agent_endpoint: form.endpoint,
          auth_config: authConfig,
          schema_hints: schemaHints,
        });
        toast.success('Project updated');
      } else {
        await createProject({
          name: form.name,
          agent_endpoint: form.endpoint,
          auth_config: authConfig,
          schema_hints: schemaHints,
        });
        toast.success('Project created');
      }
      onSuccess();
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-slate-800 border-slate-700 text-white w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Project Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="My Support Bot"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Endpoint */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Agent Endpoint URL <span className="text-red-400">*</span>
            </label>
            <Input
              value={form.endpoint}
              onChange={(e) => update('endpoint', e.target.value)}
              placeholder="https://api.example.com/chat"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
            {errors.endpoint && <p className="text-xs text-red-400">{errors.endpoint}</p>}
          </div>

          {/* Auth type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Authentication</label>
            <Select
              value={form.authType}
              onValueChange={(v) => v != null && update('authType', v)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="apikey">API Key (header)</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional auth fields */}
          {(form.authType === 'bearer' || form.authType === 'apikey') && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                {form.authType === 'bearer' ? 'Bearer Token' : 'API Key Value'}{' '}
                <span className="text-red-400">*</span>
              </label>
              <Input
                type="password"
                value={form.authValue}
                onChange={(e) => update('authValue', e.target.value)}
                placeholder="sk-..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
              {errors.authValue && <p className="text-xs text-red-400">{errors.authValue}</p>}
            </div>
          )}

          {form.authType === 'apikey' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Header Name</label>
              <Input
                value={form.authHeader}
                onChange={(e) => update('authHeader', e.target.value)}
                placeholder="X-Api-Key"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          )}

          {form.authType === 'basic' && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Username <span className="text-red-400">*</span>
                </label>
                <Input
                  value={form.authUsername}
                  onChange={(e) => update('authUsername', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                {errors.authUsername && (
                  <p className="text-xs text-red-400">{errors.authUsername}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Password <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  value={form.authPassword}
                  onChange={(e) => update('authPassword', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                {errors.authPassword && (
                  <p className="text-xs text-red-400">{errors.authPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Schema hints accordion */}
          <Accordion>
            <AccordionItem value="schema" className="border-slate-700">
              <AccordionTrigger className="text-sm text-slate-400 hover:text-slate-200 py-2">
                Advanced: Schema Hints
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p className="text-xs text-slate-500">
                  Map your agent&apos;s request/response field names if they differ from defaults.
                </p>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Caller Protocol</label>
                  <Select
                    value={form.callerProtocol}
                    onValueChange={(v) => v != null && update('callerProtocol', v)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="standard">Standard HTTP (default)</SelectItem>
                      <SelectItem value="directline">DirectLine (Bot Framework)</SelectItem>
                      <SelectItem value="tmobile">T-Mobile InfoBot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.callerProtocol === 'standard' && (
                  <>
                    {[
                      { field: 'schemaMessage', label: 'Message field name', placeholder: 'message' },
                      { field: 'schemaReply', label: 'Reply field name', placeholder: 'reply' },
                      { field: 'schemaSessionId', label: 'Session ID field name', placeholder: 'session_id' },
                      { field: 'schemaHistory', label: 'History field name', placeholder: 'conversation_history' },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field} className="space-y-1">
                        <label className="text-xs text-slate-400">{label}</label>
                        <Input
                          value={form[field as keyof FormState]}
                          onChange={(e) => update(field as keyof FormState, e.target.value)}
                          placeholder={placeholder}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 text-xs h-8"
                        />
                      </div>
                    ))}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="flex-1 text-slate-400 hover:text-white border border-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {loading && <Loader2 size={14} className="animate-spin mr-2" />}
              {isEdit ? 'Save Changes' : 'Save Project'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
