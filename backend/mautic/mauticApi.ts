// Mautic API handler (demo: Basic Auth, prod: OAuth2)
import axios from 'axios';

export async function mauticRequest(endpoint: string, method: string = 'GET', data: any = null): Promise<any> {
  const url = `${process.env.MAUTIC_BASE_URL}${endpoint}`;
  const username = process.env.MAUTIC_USERNAME ?? '';
  const password = process.env.MAUTIC_PASSWORD ?? '';
  const auth = { username, password };
  try {
    const res = await axios.request({ url, method, data, auth });
    return res.data;
  } catch (err) {
    console.error('Mautic API error:', err);
    throw err;
  }
}

// Endpoints: edit, delete, deploy campaigns, search contacts
export async function editCampaign(id: string, payload: any): Promise<any> {
  return mauticRequest(`/api/campaigns/${id}/edit`, 'POST', payload);
}
export async function deleteCampaign(id: string): Promise<any> {
  return mauticRequest(`/api/campaigns/${id}/delete`, 'DELETE');
}
export async function deployCampaign(id: string): Promise<any> {
  return mauticRequest(`/api/campaigns/${id}/deploy`, 'POST');
}
export async function searchContacts(query: string): Promise<any> {
  return mauticRequest(`/api/contacts?search=${encodeURIComponent(query)}`);
}
