import { UploadForm } from "./upload-form";

// TODO: populate from `GET /v1/admin/students` when available.
const STUB_STUDENTS = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Aarav Menon" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Ishita Rao" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Kabir Shah" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Meera Pillai" },
];

export default function AdminUploadPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-2">
          Admin
        </div>
        <h1 className="serif text-2xl md:text-4xl font-black">Upload a video</h1>
        <p className="text-sm text-[#8A8A96] mt-1">
          Direct-to-Mux upload. Add rubric scores and instructor notes alongside.
        </p>
      </div>
      <UploadForm students={STUB_STUDENTS} />
    </main>
  );
}
