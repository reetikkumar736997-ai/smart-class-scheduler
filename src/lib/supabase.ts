const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_BUCKET ?? "materials";

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getSupabaseBucket() {
  return bucket;
}

export function getSupabasePublicUrl(objectPath: string) {
  const baseUrl = requireEnv(supabaseUrl, "SUPABASE_URL");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
}

export async function uploadToSupabaseStorage(filePath: string, body: Uint8Array, contentType: string) {
  const baseUrl = requireEnv(supabaseUrl, "SUPABASE_URL");
  const key = requireEnv(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");
  const endpoint = `${baseUrl}/storage/v1/object/${bucket}/${filePath}`;
  const binary = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: new Blob([binary], { type: contentType }),
  });

  if (!response.ok) {
    throw new Error(`Storage upload failed with status ${response.status}`);
  }

  return getSupabasePublicUrl(filePath);
}

export async function deleteFromSupabaseStorage(filePath: string) {
  const baseUrl = requireEnv(supabaseUrl, "SUPABASE_URL");
  const key = requireEnv(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");
  const endpoint = `${baseUrl}/storage/v1/object/${bucket}`;

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prefixes: [filePath],
    }),
  });

  if (!response.ok) {
    throw new Error(`Storage delete failed with status ${response.status}`);
  }
}
