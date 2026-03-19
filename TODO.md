# Backend API for Owner Boarding Houses

**Status**: Exists! GET /api/boarding-houses → boardingHouseService.getAllByRole() filters by logged-in OWNER.

**Frontend Integration**
✅ service/admin/boarding_house/index.js: getAll(), getPaged().

**Next**: Hook/useBoardingHouses in RoomSelector, replace mock.

App running - test /api/boarding-houses in browser/network.
