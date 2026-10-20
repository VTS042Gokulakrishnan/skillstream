import React from 'react';
import { 
  FaUniversity, FaHome, FaUserTie, FaShoppingBag, 
  FaCalculator, FaHeadset, FaCalendarCheck, FaLaptop, 
  FaDatabase, FaPalette, FaBullhorn 
} from 'react-icons/fa';

const categories = [
  { name: 'Banking', icon: <FaUniversity /> }, // Replaced FaBank with FaUniversity
  { name: 'Work From Home', icon: <FaHome /> },
  { name: 'HR', icon: <FaUserTie /> },
  { name: 'Sales', icon: <FaShoppingBag /> },
  { name: 'Accounting', icon: <FaCalculator /> },
  { name: 'Customer Support', icon: <FaHeadset /> },
  { name: 'Event Management', icon: <FaCalendarCheck /> },
  { name: 'IT', icon: <FaLaptop /> },
  { name: 'SQL', icon: <FaDatabase /> },
  { name: 'Oracle', icon: <FaDatabase /> }, // FaDatabase reused
  { name: 'Graphic Design', icon: <FaPalette /> },
  { name: 'Digital Marketing', icon: <FaBullhorn /> },
];

const CategoryGrid = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Popular Categories</h2>
      <div className="grid grid-cols-6 grid-rows-2 gap-4 p-4">
        {categories.map((category, index) => (
            <div
          key={index}
          className="bg-blue-200 border border-black flex items-center justify-center p-2 rounded-lg"
        >
            <div className="text-2xl text-pink-500 mb-2">{category.icon}</div>
            <div className="text-sm font-medium text-center">{category.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
