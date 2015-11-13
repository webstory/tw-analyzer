#!/bin/bash
node parseraw.js ./raw_data/beginagain/2014-08-13-2014-08-19.html > beginagain-0813-0819.json&
node parseraw.js ./raw_data/beginagain/2014-08-20-2014-08-31.html > beginagain-0820-0831.json&
node parseraw.js ./raw_data/beginagain/2014-09-01-2014-09-09.html > beginagain-0901-0909.json&
node parseraw.js ./raw_data/beginagain/2014-09-10-2014-09-19.html > beginagain-0910-0919.json&
node parseraw.js ./raw_data/beginagain/2014-09-20-2014-09-30.html > beginagain-0920-0930.json&
node parseraw.js ./raw_data/beginagain/2014-10-01-2014-10-13.html > beginagain-1001-1013.json&

node parseraw.js ./raw_data/budafest_hotel/2014-03-20-2014-03-31.html > budafest_hotel-0320-0331.json&
node parseraw.js ./raw_data/budafest_hotel/2014-03-31-2014-04-10.html > budafest_hotel-0331-0410.json&
node parseraw.js ./raw_data/budafest_hotel/2014-04-10-2014-04-20.html > budafest_hotel-0410-0420.json&
node parseraw.js ./raw_data/budafest_hotel/2014-04-20-2014-04-30.html > budafest_hotel-0420-0430.json&
node parseraw.js ./raw_data/budafest_hotel/2014-04-30-2014-05-10.html > budafest_hotel-0430-0510.json&
node parseraw.js ./raw_data/budafest_hotel/2014-05-10-2014-05-20.html > budafest_hotel-0510-0520.json&
