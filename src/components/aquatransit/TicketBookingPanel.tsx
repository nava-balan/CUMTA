import { useState, useMemo } from 'react';
import { Ship, Ticket as TicketIcon, X } from 'lucide-react';
import { useGlobal } from '../../store/globalStore';
import { waterMetroRoutes, WaterMetroStation } from '../../data/waterMetroRoutes';
import QRCode from '../shared/QRCode';

export default function TicketBookingPanel() {
  const { state, bookTicket, addToast, setActiveTicketModal } = useGlobal();

  // All stations flattened with route info
  const allStations = useMemo(() => {
    const list: Array<{ station: WaterMetroStation; routeId: number; routeName: string; routeColor: string }> = [];
    waterMetroRoutes.forEach((route) => {
      route.stations.forEach((st) => {
        list.push({
          station: st,
          routeId: route.id,
          routeName: route.name,
          routeColor: route.color,
        });
      });
    });
    return list;
  }, []);

  const [originId, setOriginId] = useState<string>('R1-S4'); // Saidapet default
  const [destinationId, setDestinationId] = useState<string>('R1-S7'); // Srinivasapuram default
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [vesselClass, setVesselClass] = useState<'Eco-Catamaran' | 'Business Hydrofoil'>('Eco-Catamaran');
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);

  // Selected station objects
  const originInfo = allStations.find((s) => s.station.id === originId) || allStations[3];
  const destInfo = allStations.find((s) => s.station.id === destinationId) || allStations[6];

  // Calculate distance in km
  const distance = useMemo(() => {
    if (!originInfo || !destInfo) return 5.4;
    const [lat1, lon1] = originInfo.station.coords;
    const [lat2, lon2] = destInfo.station.coords;
    const dLat = (lat2 - lat1) * 111;
    const dLon = (lon2 - lon1) * 111 * Math.cos((lat1 * Math.PI) / 180);
    const d = Math.sqrt(dLat * dLat + dLon * dLon);
    return Math.max(2.5, Number(d.toFixed(1)));
  }, [originInfo, destInfo]);

  // Fare calculation
  const baseRate = 20 + distance * 5;
  const classMultiplier = vesselClass === 'Business Hydrofoil' ? 1.5 : 1.0;
  const baseFare = Math.round(baseRate * classMultiplier * passengerCount);

  // Points discount: up to 30% of fare or available points (1 pt = ₹1)
  const maxUsablePoints = Math.min(state.civicPoints, Math.floor(baseFare * 0.3));
  const pointsDiscount = redeemPoints ? maxUsablePoints : 0;
  const finalPrice = Math.max(15, baseFare - pointsDiscount);

  // Water Transit Time vs Road Traffic Time
  const waterTransitMinutes = Math.max(12, Math.round(distance * 2.2));
  const roadTrafficMinutes = Math.max(30, Math.round(distance * 5.8));
  const minutesSaved = Math.max(15, roadTrafficMinutes - waterTransitMinutes);

  // Departures
  const departureTimes = useMemo(() => {
    const now = new Date();
    return [10, 25, 40].map((offset) => {
      const d = new Date(now.getTime() + offset * 60000);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    });
  }, []);

  const handleBookTicket = () => {
    const payload = {
      routeId: originInfo.routeId,
      routeName: originInfo.routeName,
      fromStation: originInfo.station.name,
      toStation: destInfo.station.name,
      departureTime: departureTimes[0],
      passengerName: 'Citizen Commuter',
      passengerCount,
      vesselClass,
      baseFare,
      pointsDiscount,
      fare: finalPrice,
    };

    bookTicket(payload);

    addToast({
      type: 'success',
      title: 'WaterLink Ticket Confirmed',
      message: `Pass generated for ${originInfo.station.name} to ${destInfo.station.name}. Total: ₹${finalPrice}.`,
    });
  };

  return (
    <div className="bg-[#042F40] text-[#E8FFFA] p-4 flex flex-col gap-4 font-sans text-xs h-full">
      {/* Title */}
      <div className="pb-2 border-b border-[#0A7D8C]">
        <div className="flex items-center gap-2 mb-1">
          <TicketIcon size={16} className="text-[#48D6C5]" />
          <h2 className="font-bold text-sm text-[#E8FFFA]">Journey Planner & Ticket Zone</h2>
        </div>
        <p className="text-[11px] text-slate-300">
          Integrated Water Metro ticketing with CMRL & MTC multi-modal interchanges.
        </p>
      </div>

      {/* Origin & Destination Dropdowns */}
      <div className="p-4 rounded-lg bg-[#075B66] border border-[#0A7D8C] flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-mono text-[#48D6C5] mb-1">
            ORIGIN WATER METRO TERMINAL
          </label>
          <select
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            className="w-full bg-[#042F40] border border-[#0A7D8C] rounded-lg p-2 text-xs text-[#E8FFFA] focus:outline-none focus:border-[#48D6C5]"
          >
            {allStations.map((item) => (
              <option key={`orig-${item.station.id}`} value={item.station.id}>
                {item.station.name} ({item.routeName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-[#48D6C5] mb-1">
            DESTINATION WATER METRO TERMINAL
          </label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full bg-[#042F40] border border-[#0A7D8C] rounded-lg p-2 text-xs text-[#E8FFFA] focus:outline-none focus:border-[#48D6C5]"
          >
            {allStations.map((item) => (
              <option key={`dest-${item.station.id}`} value={item.station.id}>
                {item.station.name} ({item.routeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vessel Class & Passenger Count */}
      <div className="p-4 rounded-lg bg-[#075B66] border border-[#0A7D8C] flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-mono text-[#48D6C5] mb-2">
            VESSEL CLASS
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVesselClass('Eco-Catamaran')}
              className={`p-2 rounded-lg text-center font-medium border transition-colors ${
                vesselClass === 'Eco-Catamaran'
                  ? 'bg-[#00A6A6] text-[#042F40] border-[#00A6A6] font-semibold'
                  : 'bg-[#042F40] text-[#E8FFFA] border-[#0A7D8C] hover:bg-[#075B66]'
              }`}
            >
              Eco-Catamaran
            </button>
            <button
              type="button"
              onClick={() => setVesselClass('Business Hydrofoil')}
              className={`p-2 rounded-lg text-center font-medium border transition-colors ${
                vesselClass === 'Business Hydrofoil'
                  ? 'bg-[#00A6A6] text-[#042F40] border-[#00A6A6] font-semibold'
                  : 'bg-[#042F40] text-[#E8FFFA] border-[#0A7D8C] hover:bg-[#075B66]'
              }`}
            >
              Business Hydrofoil
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-200">PASSENGER COUNT</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPassengerCount(num)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors ${
                  passengerCount === num
                    ? 'bg-[#00A6A6] text-[#042F40]'
                    : 'bg-[#042F40] text-slate-300 border border-[#0A7D8C] hover:bg-[#075B66]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Redeem Civic Points Checkbox */}
        <label className="flex items-center gap-2 pt-2 border-t border-[#0A7D8C] cursor-pointer">
          <input
            type="checkbox"
            checked={redeemPoints}
            onChange={(e) => setRedeemPoints(e.target.checked)}
            className="w-4 h-4 accent-[#00A6A6] rounded"
          />
          <span className="text-[11px] text-[#E8FFFA]">
            Redeem Civic Points (Balance: {state.civicPoints} PTS | Save ₹{maxUsablePoints})
          </span>
        </label>
      </div>

      {/* Comparison & Fare Summary */}
      <div className="p-4 rounded-lg bg-[#075B66] border border-[#0A7D8C] flex flex-col gap-2 font-mono">
        <div className="flex justify-between items-center text-slate-300">
          <span>Water Transit Time:</span>
          <span className="font-bold text-[#48D6C5]">{waterTransitMinutes} Mins</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Road Traffic Time:</span>
          <span className="text-[#FFC145]">{roadTrafficMinutes} Mins</span>
        </div>
        <div className="flex justify-between items-center text-slate-300 font-bold">
          <span>Time Saved:</span>
          <span className="text-[#48D6C5]">{minutesSaved} Mins Saved</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Next Departure:</span>
          <span className="text-[#E8FFFA]">{departureTimes[0]} IST</span>
        </div>

        <div className="pt-2 border-t border-[#0A7D8C] flex justify-between items-center text-slate-200">
          <span>Base Fare:</span>
          <span>₹{baseFare}</span>
        </div>
        {redeemPoints && pointsDiscount > 0 && (
          <div className="flex justify-between items-center text-[#48D6C5]">
            <span>Civic Points Discount:</span>
            <span>- ₹{pointsDiscount}</span>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-sm text-[#E8FFFA] pt-1">
          <span>Final Ticket Price:</span>
          <span className="text-base text-[#48D6C5]">₹{finalPrice}</span>
        </div>
      </div>

      {/* Primary CTA Button (Strict Solid Style) */}
      <button
        onClick={handleBookTicket}
        className="w-full py-4 px-4 rounded-lg bg-[#00A6A6] text-[#042F40] font-bold text-sm hover:opacity-90 transition-opacity shadow-card flex items-center justify-center gap-2"
      >
        <Ship size={16} />
        <span>Book WaterLink Ticket</span>
      </button>

      {/* Booked Ticket Modal */}
      {state.activeTicketModal && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[#042F40] border border-[#00A6A6] rounded-lg p-8 max-w-sm w-full text-[#E8FFFA] font-sans shadow-card">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#0A7D8C]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#48D6C5]">
                  Chennai Unified Transit Pass
                </span>
                <h3 className="font-bold text-base text-[#E8FFFA]">WaterLink Boarding Pass</h3>
              </div>
              <button
                onClick={() => setActiveTicketModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center my-4">
              <QRCode data={state.activeTicketModal.qrCode} size={140} />
            </div>

            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="flex justify-between border-b border-[#0A7D8C] pb-1">
                <span className="text-slate-400">Pass ID:</span>
                <span className="font-bold text-[#48D6C5]">{state.activeTicketModal.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#0A7D8C] pb-1">
                <span className="text-slate-400">Route:</span>
                <span className="text-right">{state.activeTicketModal.routeName}</span>
              </div>
              <div className="flex justify-between border-b border-[#0A7D8C] pb-1">
                <span className="text-slate-400">Boarding:</span>
                <span className="text-right">{state.activeTicketModal.fromStation}</span>
              </div>
              <div className="flex justify-between border-b border-[#0A7D8C] pb-1">
                <span className="text-slate-400">Destination:</span>
                <span className="text-right">{state.activeTicketModal.toStation}</span>
              </div>
              <div className="flex justify-between border-b border-[#0A7D8C] pb-1">
                <span className="text-slate-400">Vessel Class:</span>
                <span className="text-right">{state.activeTicketModal.vesselClass}</span>
              </div>
              <div className="flex justify-between border-b border-[#0A7D8C] pb-1">
                <span className="text-slate-400">Departure:</span>
                <span className="text-right">{state.activeTicketModal.departureTime} IST</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-[#48D6C5]">
                <span>Fare Paid:</span>
                <span>₹{state.activeTicketModal.fare}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTicketModal(null)}
              className="w-full py-2 rounded-lg bg-[#00A6A6] text-[#042F40] font-bold text-xs hover:opacity-90"
            >
              Close Boarding Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
