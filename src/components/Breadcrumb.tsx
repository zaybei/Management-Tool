import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoIosArrowBack, IoIosHome } from 'react-icons/io';

interface BreadcrumbProps {
  segments: { label: string; path: string; isId?: boolean }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ segments = [] }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center space-x-2 text-gray-300">
      <button
        onClick={handleBack}
        className="hover:text-white focus:outline-none transition-colors duration-200 mr-2"
        aria-label="Go back"
      >
        <IoIosArrowBack size={20} />
      </button>

      <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center">
        <IoIosHome size={18} />
      </Link>

      {segments.length > 0 && <span className="mx-2 text-gray-500">/</span>}

      {segments.map((segment, index) => (
        <div key={`${segment.path}-${index}`} className="flex items-center">
          <Link
            href={segment.path}
            className={`hover:text-white transition-colors duration-200 ${index === segments.length - 1 ? 'font-medium text-white' : ''}`}
          >
            {segment.label}
          </Link>
          {index < segments.length - 1 && <span className="mx-2 text-gray-500">/</span>}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
