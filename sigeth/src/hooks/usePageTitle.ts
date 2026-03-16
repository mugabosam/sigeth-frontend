import { useLocation } from 'react-router-dom';
import type { TranslationKey } from '../i18n/translations';

const routeTitles: Record<string, TranslationKey> = {
    // 1.1 Rooms Attendant – Forms
    '/rooms-attendant/group-reservation': 'groupReservation',
    '/rooms-attendant/individual-reservation': 'individualReservation',
    '/rooms-attendant/group-member-reservation': 'groupMemberReservation',
    '/rooms-attendant/checkin-reservation': 'checkInWithReservation',
    '/rooms-attendant/twin-recording': 'twinRecording',
    '/rooms-attendant/checkin-no-reservation': 'checkInWithoutReservation',
    '/rooms-attendant/checkin-group': 'checkInGroupReservation',
    '/rooms-attendant/find-room': 'findRoom',
    '/rooms-attendant/move-guest': 'moveGuest',
    '/rooms-attendant/invoice-preview': 'invoicePreview',
    // 1.1 Rooms Attendant – Reports
    '/rooms-attendant/arrival-on': 'arrivalOn',
    '/rooms-attendant/arrival-off': 'arrivalOff',
    '/rooms-attendant/vacant-rooms': 'vacantRooms',
    '/rooms-attendant/occupied-rooms': 'occupiedRooms',
    '/rooms-attendant/checked-out-rooms': 'checkedOutRooms',
    '/rooms-attendant/daily-consumptions': 'dailyConsumptions',
    '/rooms-attendant/invoice-by-guest': 'invoiceByGuest',
    '/rooms-attendant/invoice-by-group': 'invoiceByGroup',
    // 1.2 Housekeeping – Forms
    '/housekeeping/room-board': 'roomBoard',
    '/housekeeping/room-categories': 'roomCategories',
    '/housekeeping/rooms-repertory': 'roomsRepertory',
    '/housekeeping/staff': 'housekeepingStaff',
    '/housekeeping/daily-dispatching': 'dailyDispatching',
    '/housekeeping/room-status': 'roomStatus',
    '/housekeeping/laundry-categories': 'laundryCategories',
    '/housekeeping/laundry-services': 'laundryServices',
    '/housekeeping/laundry-order': 'laundryOrder',
    '/housekeeping/request-note': 'requestNote',
    // 1.2 Housekeeping – Reports
    '/housekeeping/list-rooms': 'listRooms',
    '/housekeeping/list-staff': 'listStaff',
    '/housekeeping/daily-room-report': 'dailyRoomReport',
    '/housekeeping/laundry-journal': 'laundryJournal',
    '/housekeeping/request-follow-up': 'requestFollowUp',
    // 1.3 Banqueting – Forms
    '/banqueting/events-lots': 'eventsLots',
    '/banqueting/services-prices': 'servicesPrices',
    '/banqueting/orders': 'banquetOrders',
    '/banqueting/request-note': 'banquetRequestNote',
    // 1.3 Banqueting – Reports
    '/banqueting/services-list': 'servicesList',
    '/banqueting/service-follow-up': 'serviceFollowUp',
    '/banqueting/request-follow-up': 'banquetRequestFollowUp',
};

export function usePageTitle(): TranslationKey {
    const { pathname } = useLocation();
    return routeTitles[pathname] || 'moduleName';
}
