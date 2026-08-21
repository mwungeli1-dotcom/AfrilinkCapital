"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type ProfileUser = {
  name: string;
  email: string;
  role: string;
  phone?: string;
  country?: string;
  companyName?: string;
  avatar?: string;
  supplierStatus?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiFetch("/profile")
      .then((data) => {
        const profile = data.user as ProfileUser;
        setUser(profile);
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setCountry(profile.country || "");
        setCompanyName(profile.companyName || "");
        setAvatar(profile.avatar || "");
      })
      .catch(() => {
        toast.error("Please log in to view your profile");
        setTimeout(() => { window.location.href = "/login"; }, 800);
      });
  }, []);

  async function uploadAvatar(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      toast.error("Image upload settings are missing");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "afrilink_profiles");
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed");
      setAvatar(data.secure_url);
      toast.success("Profile picture uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile picture upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ name, phone, country, companyName, avatar }),
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("profile-updated"));
      setUser(data.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await apiFetch("/profile/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password change failed");
    }
  }

  if (!user) return <main className="min-h-screen bg-gray-100 p-8">Loading profile...</main>;
  const initials = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const fieldClass = "w-full rounded-xl border border-gray-300 p-3 focus:border-blue-700 focus:outline-none";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6"><p className="font-bold text-yellow-600">MY AFRILINK ACCOUNT</p><h1 className="text-3xl font-bold text-blue-950 md:text-4xl">Profile & Security</h1></div>
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-2xl bg-blue-950 p-6 text-center text-white shadow-xl">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-yellow-400 bg-blue-800 text-3xl font-bold">
              {avatar ? <span role="img" aria-label={user.name} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${avatar})` }} /> : initials}
            </div>
            <h2 className="mt-4 text-xl font-bold">{user.name}</h2><p className="text-sm text-blue-200">{user.email}</p>
            <span className="mt-3 inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase text-blue-950">{user.role.replace("_", " ")}</span>
            <label className="mt-5 block cursor-pointer rounded-xl border border-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-900">
              {uploading ? "Uploading..." : "Change profile picture"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadAvatar(file); }} />
            </label>
          </aside>

          <div className="space-y-6">
            <form onSubmit={saveProfile} className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-blue-950">Personal information</h2><p className="mb-5 text-sm text-gray-600">Update the information attached to your Afrilink account.</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label><span className="mb-2 block font-semibold">Full name</span><input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} required /></label>
                <label><span className="mb-2 block font-semibold">Email</span><input className={`${fieldClass} bg-gray-100`} value={user.email} readOnly /></label>
                <label><span className="mb-2 block font-semibold">Phone / WhatsApp</span><input className={fieldClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
                <label><span className="mb-2 block font-semibold">Country</span><input className={fieldClass} value={country} onChange={(e) => setCountry(e.target.value)} /></label>
                <label className="md:col-span-2"><span className="mb-2 block font-semibold">Company name</span><input className={fieldClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></label>
              </div>
              <button disabled={saving || uploading} className="mt-5 rounded-xl bg-blue-950 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60">{saving ? "Saving..." : "Save Profile"}</button>
            </form>

            <form onSubmit={changePassword} className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-blue-950">Change password</h2><p className="mb-5 text-sm text-gray-600">Your current password is required for security.</p>
              <div className="grid gap-4 md:grid-cols-3">
                <input className={fieldClass} type="password" autoComplete="current-password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <input className={fieldClass} type="password" minLength={8} autoComplete="new-password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <input className={fieldClass} type="password" minLength={8} autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button className="mt-5 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-blue-950 hover:bg-yellow-300">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
