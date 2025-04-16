interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="bg-gray-12    00 rounded-lg shadow-md p-4 text-gray-900">
      {children}
    </div>
  );
};

export default Card;
