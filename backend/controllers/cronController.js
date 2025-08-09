import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";

export const autoCheckout = async (req, res) => {
 try {
   const now = new Date();
   
   console.log("📅 Current time:", now.toISOString());
   console.log("📅 Current time (local):", now.toString());

   // First, let's see ALL active stays
   const allActiveStays = await Stay.find({ status: "active" });
   console.log("📊 Total active stays:", allActiveStays.length);
   
   // Log their checkout dates
   allActiveStays.forEach((stay, index) => {
     console.log(`Stay ${index + 1}:`, {
       id: stay._id,
       checkoutDate: stay.checkoutDate,
       checkoutDateISO: stay.checkoutDate?.toISOString(),
       isExpired: stay.checkoutDate <= now
     });
   });

   const expiredStays = await Stay.find({
     status: "active",
     checkoutDate: { $lte: now }
   });

   console.log("📋 Found stays due for checkout:", expiredStays.length);

   let count = 0;
   for (const stay of expiredStays) {
     console.log(`Processing stay ${stay._id} - checkout date: ${stay.checkoutDate}`);
     
     stay.status = "checked_out";
     await stay.save();

     await Guest.updateOne(
       { _id: stay.userId },
       { status: "checked_out", password: undefined }
     );

     await Room.updateOne(
       { roomNumber: stay.roomNumber },
       { status: "checked_out", stayDays: 0, activatedAt: null }
     );

     count++;
   }

   console.log(`✅ ${count} guests auto checked-out successfully`);

   res.json({ 
     success: true,
     message: `${count} guests auto checked-out.`,
     timestamp: now.toISOString(),
     checkedOut: count,
     totalActiveStays: allActiveStays.length,
     debug: {
       currentTime: now.toISOString(),
       activeStays: allActiveStays.map(stay => ({
         id: stay._id,
         checkoutDate: stay.checkoutDate,
         isExpired: stay.checkoutDate <= now
       }))
     }
   });
 } catch (err) {
   console.error("❌ Auto-checkout error:", err);
   res.status(500).json({ 
     success: false,
     message: err.message,
     timestamp: new Date().toISOString()
   });
 }
};