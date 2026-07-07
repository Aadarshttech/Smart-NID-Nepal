import locationData from '../data/nepal_locations.json';
import { PROVINCE_OPTIONS } from '../types/extraction';

type ProvinceName = keyof typeof locationData;

export function getProvinceNameByVal(val: string): ProvinceName | null {
  const opt = PROVINCE_OPTIONS.find(p => p.val === val);
  if (!opt || !val) return null;
  // e.g. "Bagmati/बागमती" -> "Bagmati"
  return opt.text.split('/')[0] as ProvinceName;
}

export function getDistrictsForProvince(provinceVal: string): { val: string, text: string }[] {
  const provName = getProvinceNameByVal(provinceVal);
  if (!provName || !locationData[provName]) return [];
  
  const districtsObj = locationData[provName];
  return Object.keys(districtsObj).sort().map(d => ({ val: d, text: d }));
}

export function getLocalLevelsForDistrict(provinceVal: string, districtName: string): { val: string, text: string }[] {
  const provName = getProvinceNameByVal(provinceVal);
  if (!provName || !locationData[provName]) return [];
  
  const districtsObj = (locationData[provName] as any);
  if (!districtsObj[districtName]) return [];
  
  const munis = districtsObj[districtName];
  const allMunis: string[] = [];
  
  if (munis["Ma.Na.Pa."]) allMunis.push(...munis["Ma.Na.Pa."]);
  if (munis["Upa.Ma."]) allMunis.push(...munis["Upa.Ma."]);
  if (munis["Na.Pa."]) allMunis.push(...munis["Na.Pa."]);
  if (munis["Ga.Pa."]) allMunis.push(...munis["Ga.Pa."]);
  
  return allMunis.sort().map(m => ({ val: m, text: m }));
}
