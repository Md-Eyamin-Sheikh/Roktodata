import { connectToDatabase } from './mongodb';
import { BloodRequestModel } from '@/models/BloodRequest';
import { DonorProfileModel } from '@/models/DonorProfile';
import { DonationCampModel } from '@/models/DonationCamp';
import { HospitalModel } from '@/models/Hospital';
import { AmbulanceModel } from '@/models/Ambulance';
import { NotificationModel } from '@/models/Notification';
import { UserModel } from '@/models/User';
import {
  cleanUserProfile,
  cleanInitialMyRequest,
  cleanNearbyRequests,
  cleanDonors,
  cleanDonationCamps,
  cleanHospitals,
  cleanAmbulances,
  cleanNotifications,
} from './essential-data';
import { EmergencyRequest, Donor, DonationCamp, HospitalBloodBank, AmbulanceService, AppNotification, UserProfile } from './types';

// In-Memory fallback store for environments without active MONGODB_URI
const memoryStore = {
  userProfile: { ...cleanUserProfile },
  myRequest: { ...cleanInitialMyRequest } as EmergencyRequest | null,
  nearbyRequests: [...cleanNearbyRequests],
  donors: [...cleanDonors],
  camps: [...cleanDonationCamps],
  hospitals: [...cleanHospitals],
  ambulances: [...cleanAmbulances],
  notifications: [...cleanNotifications],
};

let isDbSeeded = false;

export async function ensureDbSeeded() {
  if (isDbSeeded) return;
  const db = await connectToDatabase();
  if (!db) return; // MongoDB not connected, memory store will be used

  try {
    // 1. Seed User Profile
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      await UserModel.create({
        phone: cleanUserProfile.phone,
        name: cleanUserProfile.name,
        role: 'donor',
        locationName: cleanUserProfile.location,
        isVerified: cleanUserProfile.isVerified,
        isAvailable: cleanUserProfile.isAvailable,
        bloodGroup: cleanUserProfile.bloodGroup,
        totalDonations: cleanUserProfile.totalDonations,
        livesImpacted: cleanUserProfile.livesImpacted,
        emergencyResponses: cleanUserProfile.emergencyResponses,
        lastDonationDate: cleanUserProfile.lastDonationDate,
        nextEligibleDate: cleanUserProfile.nextEligibleDate,
        daysRemaining: cleanUserProfile.daysRemaining,
        donorId: cleanUserProfile.donorId,
      });
    }

    // 2. Seed Requests
    const reqCount = await BloodRequestModel.countDocuments();
    if (reqCount === 0) {
      // Seed initial active request
      await BloodRequestModel.create({
        requestCode: cleanInitialMyRequest.id,
        bloodGroup: cleanInitialMyRequest.bloodGroup,
        bagsNeeded: cleanInitialMyRequest.bagsNeeded,
        bagsFulfilled: cleanInitialMyRequest.bagsFulfilled,
        hospitalName: cleanInitialMyRequest.hospitalName,
        locationName: cleanInitialMyRequest.location,
        distanceKm: cleanInitialMyRequest.distanceKm,
        urgency: cleanInitialMyRequest.urgency,
        urgencyLabel: cleanInitialMyRequest.urgencyLabel,
        timeTarget: cleanInitialMyRequest.timeTarget,
        componentType: cleanInitialMyRequest.componentType,
        patientName: cleanInitialMyRequest.patientName,
        patientRelation: cleanInitialMyRequest.patientRelation,
        reason: cleanInitialMyRequest.reason,
        wardBed: `${cleanInitialMyRequest.wardNumber}, ${cleanInitialMyRequest.bedNumber}`,
        contactNumber: cleanInitialMyRequest.contactNumber,
        hasVerifiedHospital: true,
        hasPrescriptionSlip: true,
        isCaseVerified: true,
        status: 'active',
        trackingStep: 2,
        respondingDonors: [
          {
            id: 'RESP-01',
            name: 'তানভীর আহমেদ',
            bloodGroup: 'B+',
            phone: '০১৭৫২-০৪৬৫৭৮',
            distanceKm: 2.1,
            etaMinutes: 25,
            isVerified: true,
            lastDonationMonths: 4,
            status: 'on_the_way',
          },
        ],
      });

      // Seed nearby requests
      for (const req of cleanNearbyRequests) {
        await BloodRequestModel.create({
          requestCode: req.id,
          bloodGroup: req.bloodGroup,
          bagsNeeded: req.bagsNeeded,
          bagsFulfilled: req.bagsFulfilled,
          hospitalName: req.hospitalName,
          locationName: req.location,
          distanceKm: req.distanceKm,
          urgency: req.urgency,
          urgencyLabel: req.urgencyLabel,
          timeTarget: req.timeTarget,
          componentType: req.componentType,
          contactNumber: req.contactNumber || '০১৭১২-৩৪৫৬৭৮',
          hasVerifiedHospital: req.hasVerifiedHospital,
          hasPrescriptionSlip: req.hasPrescriptionSlip,
          status: 'active',
          trackingStep: 1,
          respondingDonors: [],
        });
      }
    }

    // 3. Seed Donors
    const donorCount = await DonorProfileModel.countDocuments();
    if (donorCount === 0) {
      for (const d of cleanDonors) {
        await DonorProfileModel.create({
          donorCode: d.id,
          name: d.name,
          avatarText: d.avatarText,
          bloodGroup: d.bloodGroup,
          locationName: d.location,
          distanceKm: d.distanceKm,
          isAvailableToday: d.isAvailableToday,
          isVerified: d.isVerified,
          totalDonations: d.totalDonations,
          lastDonationDate: d.lastDonationDate,
          responseTimeMinutes: d.responseTimeMinutes,
          phone: d.phone,
          isBookmarked: d.isBookmarked,
        });
      }
    }

    // 4. Seed Camps
    const campCount = await DonationCampModel.countDocuments();
    if (campCount === 0) {
      for (const c of cleanDonationCamps) {
        await DonationCampModel.create({
          campCode: c.id,
          dateDay: c.dateDay,
          dateMonth: c.dateMonth,
          time: c.time,
          organizer: c.organizer,
          venue: c.venue,
          locationName: 'বগুড়া সদর',
          isRsvp: c.isRsvp,
          registeredCount: c.registeredCount,
          description: c.description,
        });
      }
    }

    // 5. Seed Hospitals
    const hospCount = await HospitalModel.countDocuments();
    if (hospCount === 0) {
      for (const h of cleanHospitals) {
        await HospitalModel.create({
          hospitalCode: h.id,
          name: h.name,
          type: h.type,
          isOpen: h.isOpen,
          timing: h.timing,
          distanceKm: h.distanceKm,
          locationName: h.location,
          phone: h.phone,
          lastUpdated: h.lastUpdated,
          stocks: h.stocks,
        });
      }
    }

    // 6. Seed Ambulances
    const ambCount = await AmbulanceModel.countDocuments();
    if (ambCount === 0) {
      for (const a of cleanAmbulances) {
        await AmbulanceModel.create({
          ambulanceCode: a.id,
          providerName: a.providerName,
          phone: a.phone,
          locationName: a.location,
          distanceKm: a.distanceKm,
          type: a.type,
          isAvailable247: a.isAvailable247,
        });
      }
    }

    // 7. Seed Notifications
    const notifCount = await NotificationModel.countDocuments();
    if (notifCount === 0) {
      for (const n of cleanNotifications) {
        await NotificationModel.create({
          notifCode: n.id,
          category: n.category,
          title: n.title,
          description: n.description,
          timestamp: n.timestamp,
          bloodGroup: n.bloodGroup,
          donorName: n.donorName,
          isUnread: n.isUnread,
          actionType: n.actionType,
        });
      }
    }

    isDbSeeded = true;
  } catch (error) {
    console.warn('Database seeding warning:', error);
  }
}

// Queries & Operations

export async function getBloodRequests(): Promise<{
  myRequest: EmergencyRequest | null;
  nearbyRequests: EmergencyRequest[];
}> {
  const db = await connectToDatabase();
  if (!db) {
    return {
      myRequest: memoryStore.myRequest,
      nearbyRequests: memoryStore.nearbyRequests,
    };
  }

  try {
    await ensureDbSeeded();
    const all = await BloodRequestModel.find({ status: 'active' }).sort({ createdAt: -1 }).lean();
    if (!all || all.length === 0) {
      return {
        myRequest: memoryStore.myRequest,
        nearbyRequests: memoryStore.nearbyRequests,
      };
    }

    const mapped: EmergencyRequest[] = all.map((doc) => ({
      id: doc.requestCode,
      bloodGroup: doc.bloodGroup,
      bagsNeeded: doc.bagsNeeded,
      bagsFulfilled: doc.bagsFulfilled || 0,
      hospitalName: doc.hospitalName,
      location: doc.locationName,
      distanceKm: doc.distanceKm,
      urgency: doc.urgency,
      urgencyLabel: doc.urgencyLabel,
      timeTarget: doc.timeTarget,
      createdAt: '১৫ মিনিট আগে',
      componentType: doc.componentType,
      patientName: doc.patientName,
      patientRelation: doc.patientRelation,
      reason: doc.reason,
      contactNumber: doc.contactNumber,
      hasVerifiedHospital: doc.hasVerifiedHospital,
      hasPrescriptionSlip: doc.hasPrescriptionSlip,
      status: doc.status,
      trackingStep: doc.trackingStep || 1,
      respondingDonorsCount: doc.respondingDonors?.length || 0,
    }));

    return {
      myRequest: mapped.find((r) => r.id === 'REQ-2026-001') || mapped[0] || null,
      nearbyRequests: mapped.filter((r) => r.id !== 'REQ-2026-001'),
    };
  } catch (err) {
    console.error('getBloodRequests error, using memory fallback:', err);
    return {
      myRequest: memoryStore.myRequest,
      nearbyRequests: memoryStore.nearbyRequests,
    };
  }
}

export async function createBloodRequest(data: Partial<EmergencyRequest>): Promise<EmergencyRequest> {
  const newReq: EmergencyRequest = {
    id: `REQ-${Date.now()}`,
    bloodGroup: data.bloodGroup || 'A+',
    bagsNeeded: data.bagsNeeded || 1,
    bagsFulfilled: 0,
    hospitalName: data.hospitalName || 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ',
    location: data.location || 'বগুড়া সদর',
    distanceKm: 1.5,
    urgency: data.urgency || 'now',
    urgencyLabel: data.urgency === 'now' ? 'এখনই লাগবে' : 'আজকের মধ্যে',
    patientType: data.patientType || 'জরুরি রোগী',
    wardBed: data.wardBed || 'জরুরি বিভাগ',
    contactNumber: data.contactNumber || '০১৭১২-৩৪৫৬৭৮',
    prescriptionImageUrl: data.prescriptionImageUrl,
    hasVerifiedHospital: true,
    hasPrescriptionSlip: true,
    isCaseVerified: true,
    trackingStep: 1,
    createdAt: 'এইমাত্র',
    timeTarget: 'যত দ্রুত সম্ভব',
    status: 'active',
    respondingDonorsCount: 0,
  };

  // Add to memory
  memoryStore.myRequest = newReq;
  memoryStore.nearbyRequests.unshift(newReq);

  const db = await connectToDatabase();
  if (db) {
    try {
      await BloodRequestModel.create({
        requestCode: newReq.id,
        bloodGroup: newReq.bloodGroup,
        bagsNeeded: newReq.bagsNeeded,
        bagsFulfilled: 0,
        hospitalName: newReq.hospitalName,
        locationName: newReq.location,
        distanceKm: newReq.distanceKm,
        urgency: newReq.urgency,
        urgencyLabel: newReq.urgencyLabel,
        timeTarget: newReq.timeTarget,
        componentType: newReq.componentType || 'whole',
        wardBed: newReq.wardBed,
        contactNumber: newReq.contactNumber,
        hasVerifiedHospital: true,
        hasPrescriptionSlip: true,
        status: 'active',
        trackingStep: 1,
        respondingDonors: [],
      });
    } catch (err) {
      console.warn('Failed to insert into MongoDB:', err);
    }
  }

  return newReq;
}

export async function getDonors(): Promise<Donor[]> {
  const db = await connectToDatabase();
  if (!db) return memoryStore.donors;

  try {
    await ensureDbSeeded();
    const list = await DonorProfileModel.find().lean();
    if (!list || list.length === 0) return memoryStore.donors;

    return list.map((d) => ({
      id: d.donorCode,
      name: d.name,
      avatarText: d.avatarText,
      bloodGroup: d.bloodGroup,
      location: d.locationName,
      distanceKm: d.distanceKm,
      isAvailableToday: d.isAvailableToday,
      isVerified: d.isVerified,
      totalDonations: d.totalDonations,
      lastDonationDate: d.lastDonationDate,
      responseTimeMinutes: d.responseTimeMinutes,
      phone: d.phone,
      isBookmarked: d.isBookmarked,
    }));
  } catch (err) {
    console.error('getDonors error:', err);
    return memoryStore.donors;
  }
}

export async function getCamps(): Promise<DonationCamp[]> {
  const db = await connectToDatabase();
  if (!db) return memoryStore.camps;

  try {
    await ensureDbSeeded();
    const list = await DonationCampModel.find().lean();
    if (!list || list.length === 0) return memoryStore.camps;

    return list.map((c) => ({
      id: c.campCode,
      dateDay: c.dateDay,
      dateMonth: c.dateMonth,
      time: c.time,
      organizer: c.organizer,
      venue: c.venue,
      isRsvp: c.isRsvp,
      registeredCount: c.registeredCount,
      description: c.description,
    }));
  } catch (err) {
    console.error('getCamps error:', err);
    return memoryStore.camps;
  }
}

export async function toggleCampRsvp(campId: string): Promise<DonationCamp | null> {
  // Update memory
  const target = memoryStore.camps.find((c) => c.id === campId);
  if (target) {
    target.isRsvp = !target.isRsvp;
    target.registeredCount += target.isRsvp ? 1 : -1;
  }

  const db = await connectToDatabase();
  if (db) {
    try {
      const doc = await DonationCampModel.findOne({ campCode: campId });
      if (doc) {
        doc.isRsvp = !doc.isRsvp;
        doc.registeredCount += doc.isRsvp ? 1 : -1;
        await doc.save();
        return {
          id: doc.campCode,
          dateDay: doc.dateDay,
          dateMonth: doc.dateMonth,
          time: doc.time,
          organizer: doc.organizer,
          venue: doc.venue,
          isRsvp: doc.isRsvp,
          registeredCount: doc.registeredCount,
          description: doc.description,
        };
      }
    } catch (err) {
      console.warn('MongoDB toggleCampRsvp error:', err);
    }
  }

  return target || null;
}

export async function getDirectoryData(): Promise<{
  hospitals: HospitalBloodBank[];
  ambulances: AmbulanceService[];
}> {
  const db = await connectToDatabase();
  if (!db) {
    return {
      hospitals: memoryStore.hospitals,
      ambulances: memoryStore.ambulances,
    };
  }

  try {
    await ensureDbSeeded();
    const [hospitals, ambulances] = await Promise.all([
      HospitalModel.find().lean(),
      AmbulanceModel.find().lean(),
    ]);

    return {
      hospitals: hospitals.map((h) => ({
        id: h.hospitalCode,
        name: h.name,
        type: h.type,
        isOpen: h.isOpen,
        timing: h.timing,
        distanceKm: h.distanceKm,
        location: h.locationName,
        phone: h.phone,
        lastUpdated: h.lastUpdated,
        stocks: h.stocks,
      })),
      ambulances: ambulances.map((a) => ({
        id: a.ambulanceCode,
        providerName: a.providerName,
        phone: a.phone,
        location: a.locationName,
        distanceKm: a.distanceKm,
        type: a.type,
        isAvailable247: a.isAvailable247,
      })),
    };
  } catch (err) {
    console.error('getDirectoryData error:', err);
    return {
      hospitals: memoryStore.hospitals,
      ambulances: memoryStore.ambulances,
    };
  }
}

export async function getNotifications(): Promise<AppNotification[]> {
  const db = await connectToDatabase();
  if (!db) return memoryStore.notifications;

  try {
    await ensureDbSeeded();
    const list = await NotificationModel.find().sort({ createdAt: -1 }).lean();
    if (!list || list.length === 0) return memoryStore.notifications;

    return list.map((n) => ({
      id: n.notifCode,
      category: n.category,
      title: n.title,
      description: n.description,
      timestamp: n.timestamp,
      bloodGroup: n.bloodGroup,
      donorName: n.donorName,
      isUnread: n.isUnread,
      actionType: n.actionType,
    }));
  } catch (err) {
    console.error('getNotifications error:', err);
    return memoryStore.notifications;
  }
}

export async function getUserProfile(): Promise<UserProfile> {
  const db = await connectToDatabase();
  if (!db) return memoryStore.userProfile;

  try {
    await ensureDbSeeded();
    const u = await UserModel.findOne().lean();
    if (!u) return memoryStore.userProfile;

    return {
      name: u.name,
      bloodGroup: u.bloodGroup,
      donorId: u.donorId || 'RD-88421',
      phone: u.phone,
      location: u.locationName,
      isVerified: u.isVerified,
      isAvailable: u.isAvailable,
      lastDonationDate: u.lastDonationDate || '১২ আগস্ট ২০২৬',
      nextEligibleDate: u.nextEligibleDate || '১৫ নভেম্বর ২০২৬',
      daysRemaining: u.daysRemaining || 23,
      totalDonations: u.totalDonations,
      livesImpacted: u.livesImpacted,
      emergencyResponses: u.emergencyResponses,
      quietHoursEnabled: true,
      quietHoursStart: '২৩:০০',
      quietHoursEnd: '০৬:০০',
      notificationRadiusKm: 10,
      phoneVisibility: 'verified_family',
      language: 'bn',
      textSize: '100%',
      reducedMotion: false,
      isProfileComplete: true,
    };
  } catch (err) {
    console.error('getUserProfile error:', err);
    return memoryStore.userProfile;
  }
}

export async function toggleUserAvailability(): Promise<boolean> {
  memoryStore.userProfile.isAvailable = !memoryStore.userProfile.isAvailable;
  const db = await connectToDatabase();
  if (db) {
    try {
      const u = await UserModel.findOne();
      if (u) {
        u.isAvailable = !u.isAvailable;
        await u.save();
        return u.isAvailable;
      }
    } catch (err) {
      console.warn('toggleUserAvailability db error:', err);
    }
  }
  return memoryStore.userProfile.isAvailable;
}
