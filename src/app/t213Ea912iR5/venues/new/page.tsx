import { VenueForm } from "@/components/admin/VenueForm";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminNewVenuePage() {
  return (
    <AdminShell authed>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-slate-900">
        Новое заведение
      </h1>
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <VenueForm
          mode="create"
          initialValues={{
            name: "",
            address: "",
            phone: "",
            website: "",
            lat: "52.286974",
            lng: "104.305018",
          }}
        />
      </div>
    </AdminShell>
  );
}
