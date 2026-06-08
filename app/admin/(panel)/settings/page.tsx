"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AdminSection } from "@/components/admin/AdminCards";
import { adminFetch } from "@/lib/admin-client";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type SiteSettings = {
  whatsappNumber?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
  };
  aboutText?: string;
  storeEmail?: string;
  storeAddress?: string;
  footerCopyright?: string;
};

export default function AdminSiteSettingsPage() {
  const [form, setForm] = useState<SiteSettings>({
    whatsappNumber: "",
    socialLinks: { instagram: "", facebook: "" },
    aboutText: "",
    storeEmail: "",
    storeAddress: "",
    footerCopyright: ""
  });
  const [baseSettings, setBaseSettings] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const storageKey = "artisan-root-site-settings-draft";

  useEffect(() => {
    adminFetch<{ settings: Record<string, unknown> & SiteSettings }>("/api/settings")
      .then((res) => {
        const settings = res.data.settings;
        setBaseSettings(settings);
        setForm({
          whatsappNumber: settings.whatsappNumber ?? "",
          socialLinks: {
            instagram: settings.socialLinks?.instagram ?? "",
            facebook: settings.socialLinks?.facebook ?? ""
          },
          aboutText: settings.aboutText ?? "",
          storeEmail: settings.storeEmail ?? "",
          storeAddress: settings.storeAddress ?? "",
          footerCopyright: settings.footerCopyright ?? ""
        });

        const draft = window.localStorage.getItem(storageKey);
        if (draft) {
          setForm(JSON.parse(draft) as SiteSettings);
          toast("Unsaved site settings draft restored.");
        }
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  const draft = useMemo(() => form, [form]);

  useEffect(() => {
    if (!isLoading) window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, isLoading]);

  const update = (key: keyof SiteSettings, value: unknown) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateSocial = (key: "instagram" | "facebook", value: string) => {
    setForm((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [key]: value
      }
    }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await adminFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ ...baseSettings, ...form })
      });
      window.localStorage.removeItem(storageKey);
      toast.success("Site settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-artisan-sage">Configuration</p>
          <h1 className="font-heading text-4xl font-bold text-artisan-brown">Site Settings</h1>
        </div>
        <button disabled={isSaving || isLoading} onClick={save} className="rounded-full bg-artisan-terracotta px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:opacity-60">
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <AdminSection title="Contact and Social">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-artisan-cream" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-artisan-brown">
              WhatsApp number
              <input value={form.whatsappNumber ?? ""} onChange={(event) => update("whatsappNumber", event.target.value)} className="field-input" placeholder="919999999999" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-artisan-brown">
              Store email
              <input type="email" value={form.storeEmail ?? ""} onChange={(event) => update("storeEmail", event.target.value)} className="field-input" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-artisan-brown">
              Instagram URL
              <input value={form.socialLinks?.instagram ?? ""} onChange={(event) => updateSocial("instagram", event.target.value)} className="field-input" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-artisan-brown">
              Facebook URL
              <input value={form.socialLinks?.facebook ?? ""} onChange={(event) => updateSocial("facebook", event.target.value)} className="field-input" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-artisan-brown md:col-span-2">
              Store address
              <textarea value={form.storeAddress ?? ""} onChange={(event) => update("storeAddress", event.target.value)} className="field-input min-h-28" />
            </label>
          </div>
        )}
      </AdminSection>

      <AdminSection title="About Page Text" description="Markdown is supported for headings, paragraphs, and lists.">
        <div data-color-mode="light">
          <MDEditor value={form.aboutText ?? ""} onChange={(value) => update("aboutText", value ?? "")} height={260} />
        </div>
      </AdminSection>

      <AdminSection title="Footer">
        <label className="grid gap-2 text-sm font-bold text-artisan-brown">
          Footer copyright text
          <input value={form.footerCopyright ?? ""} onChange={(event) => update("footerCopyright", event.target.value)} className="field-input" placeholder="(c) 2025 Artisan Root" />
        </label>
      </AdminSection>
    </div>
  );
}
