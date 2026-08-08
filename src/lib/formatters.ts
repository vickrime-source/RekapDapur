export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absAmount);

  // Format result nicely like "Rp 150.000" instead of "Rp150.000,00"
  const cleanFormatted = formatted.replace('Rp', 'Rp ');
  return isNegative ? `-${cleanFormatted}` : cleanFormatted;
}

export function formatTanggal(dateStr: string, includeDayName = true): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(date.getTime())) return dateStr;

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(includeDayName ? { weekday: 'long' } : {}),
    };

    return date.toLocaleDateString('id-ID', options);
  } catch (e) {
    return dateStr;
  }
}

export function formatTanggalDisatuin(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(date.getTime())) return dateStr;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    return `${dayName}, ${dayNum} ${monthName}`;
  } catch (e) {
    return dateStr;
  }
}

export function formatTanggalRealtime(): string {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function generateInvoiceNumber(suffix?: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  const cleanSuffix = suffix ? `/${suffix.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)}` : '';
  return `INV/${year}${month}${day}${cleanSuffix}/${randomNum}`;
}

export function getTokoBadgeStyle(tokoName: string): string {
  if (!tokoName) return 'bg-slate-100 text-slate-800 border-slate-200';
  const nameUpper = tokoName.toUpperCase().trim();
  
  if (nameUpper.includes('HTG')) {
    return 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-2xs font-extrabold';
  }
  if (nameUpper.includes('ADIFRUITA') || nameUpper.includes('ADI')) {
    return 'bg-orange-100 text-orange-950 border-orange-300 shadow-2xs font-extrabold';
  }
  if (nameUpper.includes('PROHE')) {
    return 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs font-extrabold';
  }
  if (nameUpper.includes('LUWENG')) {
    return 'bg-pink-100 text-pink-950 border-pink-300 shadow-2xs font-extrabold';
  }
  
  return 'bg-sky-100 text-sky-950 border-sky-300 shadow-2xs font-extrabold';
}

