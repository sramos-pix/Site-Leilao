import { supabase } from "@/lib/supabase";

export async function uploadLotPhoto(lotId: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `lots/${lotId}/${filename}`;

  // Tenta o upload direto
  const { error: uploadError } = await supabase.storage
    .from("vehicle-photos")
    .upload(storagePath, file, { 
      upsert: true, 
      contentType: file.type,
      cacheControl: '3600'
    });

  if (uploadError) {
    console.error("Erro detalhado do Storage:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("vehicle-photos").getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl };
}

export async function deleteLotPhoto(storagePath: string) {
  const { error } = await supabase.storage.from("vehicle-photos").remove([storagePath]);
  if (error) throw error;
}