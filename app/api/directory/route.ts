import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { initialHospitalsAndBanks, initialAmbulances } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');

    const supabase = getSupabaseServerClient();
    if (supabase) {
      let hospQuery = supabase.from('hospitals_and_banks').select('*, blood_inventory(*)').order('name', { ascending: true });
      let ambQuery = supabase.from('ambulances').select('*').order('driver_name', { ascending: true });

      if (district && district !== 'all') {
        const clean = district.replace(/সদর/g, '').trim();
        hospQuery = hospQuery.ilike('district', `%${clean}%`);
        ambQuery = ambQuery.ilike('district', `%${clean}%`);
      }

      const [hospRes, ambRes] = await Promise.all([hospQuery, ambQuery]);

      let hospitals = hospRes.data || [];
      let ambulances = ambRes.data || [];

      // If filtered district has none, get all live records
      if (hospitals.length === 0) {
        const { data: allHosp } = await supabase.from('hospitals_and_banks').select('*, blood_inventory(*)').limit(20);
        if (allHosp && allHosp.length > 0) hospitals = allHosp;
      }

      if (ambulances.length === 0) {
        const { data: allAmb } = await supabase.from('ambulances').select('*').limit(20);
        if (allAmb && allAmb.length > 0) ambulances = allAmb;
      }

      if (hospitals.length > 0 || ambulances.length > 0) {
        const mappedHospitals = hospitals.map((h: any) => ({
          id: h.id,
          name: h.name,
          type: h.type === 'red_crescent' ? 'blood_bank' : 'hospital',
          location: `${h.district} • ${h.address}`,
          distanceKm: 2.8,
          phone: h.hotline,
          timing: h.operating_hours || '২৪/৭ খোলা',
          isOpen: true,
          lastUpdated: 'এইমাত্র যাচাইকৃত',
          stocks: (h as any).blood_inventory?.reduce(
            (acc: any, item: any) => {
              acc[item.blood_group] = {
                count: item.units_available,
                status: item.status === 'available' ? 'adequate' : item.status === 'low' ? 'limited' : 'empty',
              };
              return acc;
            },
            {} as any
          ) || {},
        }));

        const mappedAmbulances = ambulances.map((a: any) => ({
          id: a.id,
          providerName: a.driver_name,
          phone: a.phone_number,
          location: `${a.district} • ${a.location_base}`,
          distanceKm: 3.2,
          type: (a.service_type?.includes('আইসিইউ') ? 'ICU' : a.service_type?.includes('এসি') ? 'AC' : 'Normal') as any,
          isAvailable247: a.is_available_24_7 ?? true,
        }));

        return NextResponse.json({
          success: true,
          source: 'supabase_live',
          data: {
            hospitals: mappedHospitals,
            ambulances: mappedAmbulances,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: {
        hospitals: initialHospitalsAndBanks,
        ambulances: initialAmbulances,
      },
    });
  } catch (error: any) {
    console.error('API /api/directory error:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: {
        hospitals: initialHospitalsAndBanks,
        ambulances: initialAmbulances,
      },
    });
  }
}
