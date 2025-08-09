import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";

// No dotenv/config/connectDB here

export const autoCheckout = async (req, res) => {
 try {
   const now = new Date();
   // Remove the setHours line to use current time instead of forcing 12 PM
   
   console.log("📅 Auto-checkout running at:", now.toISOString());

   const expiredStays = await Stay.find({
     status: "active",
     checkoutDate: { $lte: now }, // This will now check against current time
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
     checkedOut: count
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