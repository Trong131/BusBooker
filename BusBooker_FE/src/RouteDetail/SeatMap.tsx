import React from 'react';
import { PiArmchairFill, PiSteeringWheelFill } from 'react-icons/pi';
import { TbArmchair2, TbArmchair2Off } from 'react-icons/tb';
import { Seat } from '../types';

interface SeatProps {
  seat: Seat;
  handleSeatClick: (seatNumber: string) => void;
  isSelected: boolean;
}

const SeatComponent: React.FC<SeatProps> = ({ seat, handleSeatClick, isSelected }) => {
  let color = '';
  if (seat.location === 'front') color = 'text-purple-400';
  else if (seat.location === 'middle') color = 'text-orange-400';
  else if (seat.location === 'back') color = 'text-green-400';

  return (
    <div
      className={`text-3xl ${color} cursor-pointer transition-transform hover:scale-110`}
      onClick={() => {
        if (!seat.isBooked) {
          handleSeatClick(seat.seatNumber);
        }
      }}
    >
      {seat.isBooked ? (
        <TbArmchair2Off className='text-gray-600' />
      ) : (
        isSelected ? <PiArmchairFill className='text-green-500' /> : <TbArmchair2 />
      )}
    </div>
  );
};

interface SeatMapProps {
  seats?: Seat[];
  handleSeatClick: (seatNumber: string) => void;
  selectedSeats?: string[];
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, handleSeatClick, selectedSeats = [] }) => {
  if (!seats || seats.length === 0) {
    return (
      <div className='flex items-center justify-center bg-gray-100 p-5 rounded-lg w-80 h-64'>
        <p className='text-gray-600 font-semibold'>Không có dữ liệu ghế</p>
      </div>
    );
  }

  const frontSeats = seats.filter((seat) => seat.location === 'front');
  const middleSeats = seats.filter((seat) => seat.location === 'middle');
  const backSeats = seats.filter((seat) => seat.location === 'back');

  return (
    <div className='flex flex-col items-center bg-gray-100 p-5 rounded-lg'>
      <div className='grid grid-cols-3 gap-4 mb-4'>
        <p><PiSteeringWheelFill className='text-3xl' /></p>
        {frontSeats.map((seat) => (
          <SeatComponent 
            key={seat.id} 
            seat={seat} 
            handleSeatClick={handleSeatClick}
            isSelected={selectedSeats.includes(seat.seatNumber)}
          />
        ))}
      </div>

      <div className='grid grid-cols-2 gap-x-[62px] gap-y-4 mb-4'>
        {middleSeats.map((seat) => (
          <SeatComponent 
            key={seat.id} 
            seat={seat} 
            handleSeatClick={handleSeatClick}
            isSelected={selectedSeats.includes(seat.seatNumber)}
          />
        ))}
      </div>

      <div
        className={`grid ${
          backSeats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
        } gap-4`}
      >
        {backSeats.map((seat) => (
          <SeatComponent 
            key={seat.id} 
            seat={seat} 
            handleSeatClick={handleSeatClick}
            isSelected={selectedSeats.includes(seat.seatNumber)}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatMap;

