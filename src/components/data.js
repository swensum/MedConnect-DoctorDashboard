export const APPTS0 = [
  { id: 1, name: "Aarav Sharma", age: 34, time: "09:30 AM", type: "Video", reason: "Recurring migraine", status: "upcoming" },
  { id: 2, name: "Sita Thapa", age: 52, time: "10:15 AM", type: "Chat", reason: "Blood pressure review", status: "upcoming" },
  { id: 3, name: "Bikash Rai", age: 28, time: "11:00 AM", type: "Voice", reason: "Skin allergy follow-up", status: "pending" },
  { id: 4, name: "Maya Gurung", age: 41, time: "02:00 PM", type: "Video", reason: "Diabetes check-in", status: "pending" },
  { id: 5, name: "Ramesh KC", age: 60, time: "04:30 PM", type: "Chat", reason: "Knee pain", status: "upcoming" },
];
export const CHAT0 = [
  { me: 0, t: "Hello doctor, the headaches are back since Monday." },
  { me: 1, t: "Sorry to hear that, Aarav. Any nausea or light sensitivity?" },
  { me: 0, t: "Yes, bright light makes it worse." },
];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const init = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");
export const WEEK = [["Mon", 12], ["Tue", 15], ["Wed", 9], ["Thu", 18], ["Fri", 14], ["Sat", 7], ["Sun", 4]];
export const EARN = [["Apr", 12400], ["May", 14800], ["Jun", 13200], ["Jul", 16900], ["Aug", 15600], ["Sep", 18400]];
export const ACTIVITY = [
  { t: "Prescription sent to Sita Thapa", time: "8 min ago", tone: "ok" },
  { t: "New booking request from Maya Gurung", time: "25 min ago", tone: "nv" },
  { t: "Bikash Rai left a 5★ review", time: "1 hr ago", tone: "ok" },
  { t: "Appointment declined: Hari Oli", time: "3 hrs ago", tone: "bad" },
  { t: "Payment received: Rs 500", time: "Yesterday", tone: "ok" },
];