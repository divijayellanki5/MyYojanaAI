import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES, type Profile } from "@/lib/schemes";
import { useProfile, useSaveProfile, useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — MyYojanaAI" }, { name: "description", content: "Your details for scheme matching." }] }),
  component: ProfilePage,
});

const STATES = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal","Other"];
const STEPS = ["Basic", "Financial", "Category", "Preferences"];

function Select({ id, value, onChange, options }: { id: string; value: string | null; onChange: (v: string) => void; options: string[] }) {
  return (
    <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-md border bg-card px-3 text-sm">
      <option value="">Select…</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function ProfilePage() {
  const { user } = useSession();
  const { data } = useProfile(user?.id);
  const save = useSaveProfile(user?.id);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Partial<Profile>>({});
  useEffect(() => { if (data) setF(data); }, [data]);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    const { id: _id, ...rest } = f as Profile;
    try {
      await save.mutateAsync(rest);
      if (step < STEPS.length - 1) setStep(step + 1);
      else { toast.success("Profile saved"); navigate({ to: "/recommendations" }); }
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold">My profile</h1>
        <p className="mt-1 text-muted-foreground">Used only to match you with schemes. Visible only to you.</p>
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button onClick={() => setStep(i)} className="w-full text-left">
                <div className={cn("h-1.5 rounded-full", i <= step ? "bg-secondary" : "bg-muted")} />
                <p className={cn("mt-2 text-xs", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>{i + 1}. {s}</p>
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-6 space-y-5 rounded-lg border bg-card p-6">
          {step === 0 && (<>
            <div className="space-y-1.5"><Label htmlFor="n">Full name</Label><Input id="n" value={f.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} /></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="a">Age</Label><Input id="a" type="number" min={0} max={120} value={f.age ?? ""} onChange={(e) => set("age", e.target.value ? Number(e.target.value) : null)} /></div>
              <div className="space-y-1.5"><Label htmlFor="g">Gender</Label><Select id="g" value={f.gender ?? null} onChange={(v) => set("gender", v || null)} options={["Female", "Male", "Other"]} /></div>
              <div className="space-y-1.5"><Label htmlFor="s">State</Label><Select id="s" value={f.state ?? null} onChange={(v) => set("state", v || null)} options={STATES} /></div>
              <div className="space-y-1.5"><Label htmlFor="ar">Area</Label><Select id="ar" value={f.area ?? null} onChange={(v) => set("area", v || null)} options={["Rural", "Urban"]} /></div>
            </div>
          </>)}
          {step === 1 && (<>
            <div className="space-y-1.5"><Label htmlFor="i">Annual family income (₹)</Label><Input id="i" type="number" min={0} value={f.annual_income ?? ""} onChange={(e) => set("annual_income", e.target.value ? Number(e.target.value) : null)} /></div>
            <div className="space-y-1.5"><Label htmlFor="o">Occupation</Label><Select id="o" value={f.occupation ?? null} onChange={(v) => set("occupation", v || null)} options={["Farmer", "Self-employed", "Business owner", "Salaried", "Student", "Unemployed", "Retired", "Homemaker"]} /></div>
            <div className="flex items-center justify-between rounded-md border p-3"><Label htmlFor="bpl">Below poverty line (BPL card)</Label><Switch id="bpl" checked={!!f.is_bpl} onCheckedChange={(v) => set("is_bpl", v)} /></div>
          </>)}
          {step === 2 && (<>
            <div className="space-y-1.5"><Label htmlFor="c">Social category</Label><Select id="c" value={f.category ?? null} onChange={(v) => set("category", v || null)} options={["General", "OBC", "SC", "ST", "EWS"]} /></div>
            <div className="flex items-center justify-between rounded-md border p-3"><Label htmlFor="fa">I am a farmer / own agricultural land</Label><Switch id="fa" checked={!!f.is_farmer} onCheckedChange={(v) => set("is_farmer", v)} /></div>
            <div className="flex items-center justify-between rounded-md border p-3"><Label htmlFor="d">Person with disability</Label><Switch id="d" checked={!!f.has_disability} onCheckedChange={(v) => set("has_disability", v)} /></div>
          </>)}
          {step === 3 && (
            <div>
              <Label>What kind of support are you looking for?</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = f.interests?.includes(c);
                  return (
                    <button key={c} type="button" onClick={() => set("interests", on ? (f.interests ?? []).filter((x) => x !== c) : [...(f.interests ?? []), c])}
                      className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "border-secondary bg-secondary text-secondary-foreground" : "text-muted-foreground")}>{c}</button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex justify-between border-t pt-5">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            <Button onClick={submit} disabled={save.isPending}>{step < STEPS.length - 1 ? "Save & continue" : "Save & see recommendations"}</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
