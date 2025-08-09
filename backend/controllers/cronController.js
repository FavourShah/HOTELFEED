import { Stay } from "../models/stay.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";

export const autoCheckout = async (req, res) => {
 try {
   const now = new Date();
   
   console.log("🚀 Auto-checkout process started");
   console.log("📅 Current time:", now.toISOString());
   console.log("📅 Current time (readable):", now.toString());

   // Find all active stays first for debugging
   const allActiveStays = await Stay.find({ status: "active" });
   console.log("📊 Total active stays found:", allActiveStays.length);

   // Log details of each active stay
   allActiveStays.forEach((stay, index) => {
     console.log(`📋 Active Stay ${index + 1}:`, {
       id: stay._id,
       roomNumber: stay.roomNumber,
       userId: stay.userId,
       checkoutDate: stay.checkoutDate,
       checkoutDateISO: stay.checkoutDate?.toISOString(),
       isExpired: stay.checkoutDate <= now,
       createdAt: stay.createdAt
     });
   });

   // Find stays due for checkout
   const expiredStays = await Stay.find({
     status: "active",
     checkoutDate: { $lte: now }
   });

   console.log(`🎯 Stays due for checkout: ${expiredStays.length}`);

   if (expiredStays.length === 0) {
     console.log("✨ No stays need checkout at this time");
   }

   let count = 0;
   for (const stay of expiredStays) {
     console.log(`⚡ Processing checkout for stay ${stay._id}`);
     console.log(`   - Room: ${stay.roomNumber}`);
     console.log(`   - User: ${stay.userId}`);
     console.log(`   - Checkout date: ${stay.checkoutDate}`);
     
     // Update stay status
     stay.status = "checked_out";
     await stay.save();
     console.log(`   ✅ Stay status updated to checked_out`);

     // Update guest
     const guestUpdate = await Guest.updateOne(
       { _id: stay.userId },
       { status: "checked_out", password: undefined }
     );
     console.log(`   👤 Guest updated:`, guestUpdate.modifiedCount > 0 ? "Success" : "Failed");

     // Update room
     const roomUpdate = await Room.updateOne(
       { roomNumber: stay.roomNumber },
       { status: "checked_out", stayDays: 0, activatedAt: null }
     );
     console.log(`   🏠 Room updated:`, roomUpdate.modifiedCount > 0 ? "Success" : "Failed");

     count++;
     console.log(`   🎉 Stay ${stay._id} successfully checked out (${count}/${expiredStays.length})`);
   }

   console.log(`✅ Auto-checkout completed: ${count} guests processed`);
   console.log("🏁 Process finished successfully");

   res.json({ 
     success: true,
     message: `${count} guests auto checked-out successfully.`,
     timestamp: now.toISOString(),
     checkedOut: count,
     totalActiveStays: allActiveStays.length,
     processedAt: now.toString()
   });

 } catch (err) {
   console.error("❌ Auto-checkout error occurred:");
   console.error("Error message:", err.message);
   console.error("Error stack:", err.stack);
   console.error("Error details:", err);
   
   res.status(500).json({ 
     success: false,
     message: err.message,
     timestamp: new Date().toISOString(),
     error: "Auto-checkout process failed"
   });
 }
};