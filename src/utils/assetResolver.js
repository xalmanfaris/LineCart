import camelMilk from '../assets/Camel_Milk.webp';
import mabroom from '../assets/Mabroom.jpg';
import medjool from '../assets/Medjool.jpg';
import almondCal from '../assets/almond-california.jpg';
import background from '../assets/background.jpg';
import background1 from '../assets/background1.jpg';
import darkChoc from '../assets/dark-chocolae.jpg';
import holyAjwa from '../assets/holyajwa.webp';
import honeyCashews from '../assets/honey-cashews.jpg';
import linecartBrand from '../assets/linecartbrand.png';
import linecartLogo from '../assets/linecartlogo.png';
import premChoc from '../assets/premium-chocolate.webp';
import roastedCashews from '../assets/roasted-cashews.webp';
import saagiDates from '../assets/saagi-dates.jpg';
import safawi from '../assets/safawi.png';
import w320Cashews from '../assets/w320-cashews.jpeg';

// Map local file basenames to imported bundled assets
const assetMap = {
  'camel_milk.webp': camelMilk,
  'mabroom.jpg': mabroom,
  'medjool.jpg': medjool,
  'almond-california.jpg': almondCal,
  'background.jpg': background,
  'background1.jpg': background1,
  'dark-chocolae.jpg': darkChoc,
  'holyajwa.webp': holyAjwa,
  'honey-cashews.jpg': honeyCashews,
  'linecartbrand.png': linecartBrand,
  'linecartlogo.png': linecartLogo,
  'premium-chocolate.webp': premChoc,
  'roasted-cashews.webp': roastedCashews,
  'saagi-dates.jpg': saagiDates,
  'safawi.png': safawi,
  'w320-cashews.jpeg': w320Cashews,
};

// High quality fallback images by category
const categoryFallbacks = {
  dates: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800',
  badam: 'https://images.unsplash.com/photo-1508061252966-dfd30f67ea55?auto=format&fit=crop&q=80&w=800',
  cashew: 'https://images.unsplash.com/photo-1543208541-005dd2419952?auto=format&fit=crop&q=80&w=800',
  chocolate: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=800',
  beverage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800',
  default: 'https://images.unsplash.com/photo-1608797178974-15b35a6405bd?auto=format&fit=crop&q=80&w=800'
};

export function resolveAssetImage(pathOrUrl, category = '', productName = '') {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') {
    return getCategoryFallback(category, productName);
  }

  const cleanStr = pathOrUrl.trim();

  // If HTTP/HTTPS URL or Data URI
  if (cleanStr.startsWith('http://') || cleanStr.startsWith('https://') || cleanStr.startsWith('data:image/')) {
    return cleanStr;
  }

  // Extract filename from local paths like "/src/assets/holyajwa.webp"
  const fileName = cleanStr.split('/').pop().toLowerCase();
  if (assetMap[fileName]) {
    return assetMap[fileName];
  }

  // Check matching key without extension or formatting
  for (const [key, asset] of Object.entries(assetMap)) {
    if (key.includes(fileName) || fileName.includes(key.split('.')[0])) {
      return asset;
    }
  }

  return getCategoryFallback(category, productName);
}

function getCategoryFallback(category = '', name = '') {
  const cat = (category || name).toLowerCase();
  if (cat.includes('date') || cat.includes('ajwa') || cat.includes('medjool') || cat.includes('sagai') || cat.includes('safawi') || cat.includes('sukkari')) {
    return categoryFallbacks.dates;
  }
  if (cat.includes('badam') || cat.includes('almond')) {
    return categoryFallbacks.badam;
  }
  if (cat.includes('cashew') || cat.includes('kaju') || cat.includes('w320')) {
    return categoryFallbacks.cashew;
  }
  if (cat.includes('choc') || cat.includes('cocoa') || cat.includes('sweet')) {
    return categoryFallbacks.chocolate;
  }
  if (cat.includes('milk') || cat.includes('drink') || cat.includes('camel')) {
    return categoryFallbacks.beverage;
  }
  return categoryFallbacks.default;
}

export {
  camelMilk,
  mabroom,
  medjool,
  almondCal,
  background,
  background1,
  darkChoc,
  holyAjwa,
  honeyCashews,
  linecartBrand,
  linecartLogo,
  premChoc,
  roastedCashews,
  saagiDates,
  safawi,
  w320Cashews
};
