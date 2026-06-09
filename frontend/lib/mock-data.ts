export type RestaurantCategory = "nuong" | "lau" | "cafe" | "bun-pho" | "com";

export type Review = {
  id: string;
  user: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  category: RestaurantCategory;
  categoryLabel: string;
  district: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  priceRange: 1 | 2 | 3;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  aiMatch: number;
  distanceKm: number;
  isOpenNow: boolean;
  openHours: string;
  phone: string;
  images: string[];
  tags: string[];
  features: string[];
  description: string;
  aiInsight: string;
  reviews: Review[];
};

export const restaurants: Restaurant[] = [
  {
    id: "r-001",
    slug: "pho-nuong-sai-gon",
    name: "Phố Nướng Sài Gòn",
    category: "nuong",
    categoryLabel: "Nướng than",
    district: "Quận 1",
    city: "TP. Ho Chi Minh",
    address: "123 Lê Lợi, Bến Thành, Quận 1",
    lat: 10.7724,
    lng: 106.6982,
    priceRange: 2,
    priceLabel: "100k-300k/người",
    rating: 4.7,
    reviewCount: 482,
    aiMatch: 98,
    distanceKm: 0.8,
    isOpenNow: true,
    openHours: "10:00 - 23:30",
    phone: "028-3821-1234",
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["đông khách", "ướp ngon", "phục vụ nhanh"],
    features: ["đặt bàn", "giao hàng", "giữ xe"],
    description:
      "Quán nướng than hoa nổi tiếng khu trung tâm, đặc biệt món sườn bò ướp mật ong và hải sản tươi mỗi ngày.",
    aiInsight:
      "Dữ liệu vector từ 1.240 review cho thấy quán này nằm trong nhóm top 2% về tỉ lệ hài lòng trên giá thành ở khu trung tâm.",
    reviews: [
      {
        id: "rv-001",
        user: "Duy Nguyen",
        rating: 4.5,
        content: "Thịt ướp đậm vị, lên món nhanh, giá hợp lý cho nhóm bạn.",
        createdAt: "2026-05-27"
      },
      {
        id: "rv-002",
        user: "Mai Anh",
        rating: 5,
        content: "Nước chấm ngon và không gian sạch sẽ, sẽ quay lại.",
        createdAt: "2026-05-20"
      }
    ]
  },
  {
    id: "r-002",
    slug: "bbq-garden-riverside",
    name: "BBQ Garden Riverside",
    category: "nuong",
    categoryLabel: "Nướng vườn",
    district: "Quận 2",
    city: "TP. Ho Chi Minh",
    address: "57 Đường số 10, Thảo Điền, Quận 2",
    lat: 10.8067,
    lng: 106.7313,
    priceRange: 1,
    priceLabel: "<100k/người",
    rating: 4.5,
    reviewCount: 1204,
    aiMatch: 92,
    distanceKm: 1.4,
    isOpenNow: true,
    openHours: "11:00 - 23:00",
    phone: "028-3899-8800",
    images: [
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["giá mềm", "nhóm đông", "ngoài trời"],
    features: ["giữ xe", "tổ chức tiệc"],
    description:
      "Khu nướng ven sông, phù hợp nhóm đông người với menu nhiều combo tiết kiệm.",
    aiInsight:
      "Mô hình đánh giá đây là điểm đến có độ ổn định cao cho tiêu chí giá rẻ và phục vụ nhanh vào buổi tối.",
    reviews: [
      {
        id: "rv-003",
        user: "Khanh Linh",
        rating: 4,
        content: "Không gian đẹp, giá dễ chịu, cuối tuần hơi đông.",
        createdAt: "2026-05-29"
      }
    ]
  },
  {
    id: "r-003",
    slug: "via-he-quan-grilled",
    name: "Vỉa Hè Quán Grilled",
    category: "nuong",
    categoryLabel: "Nướng vỉa hè",
    district: "Quận 3",
    city: "TP. Ho Chi Minh",
    address: "88 Võ Văn Tần, Quận 3",
    lat: 10.7803,
    lng: 106.6884,
    priceRange: 1,
    priceLabel: "<100k/người",
    rating: 4.2,
    reviewCount: 890,
    aiMatch: 89,
    distanceKm: 2.1,
    isOpenNow: true,
    openHours: "16:00 - 00:30",
    phone: "028-3920-4455",
    images: [
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["chuẩn vị", "giá sinh viên", "đông vui"],
    features: ["mang về", "gọi món nhanh"],
    description: "Điểm hẹn ẩm thực đêm với hương vị nướng đường phố đặc trưng.",
    aiInsight:
      "Điểm số semantic cao cho nhóm tìm kiếm trải nghiệm địa phương và ngân sách thấp.",
    reviews: []
  },
  {
    id: "r-004",
    slug: "hani-roastery-lab",
    name: "Hani Roastery Lab",
    category: "cafe",
    categoryLabel: "Specialty coffee",
    district: "Hoàn Kiếm",
    city: "Hà Nội",
    address: "42 Tràng Thi, Hoàn Kiếm",
    lat: 21.0285,
    lng: 105.8506,
    priceRange: 2,
    priceLabel: "100k-300k/người",
    rating: 4.8,
    reviewCount: 320,
    aiMatch: 95,
    distanceKm: 0.6,
    isOpenNow: true,
    openHours: "07:00 - 22:30",
    phone: "024-3938-1111",
    images: [
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["có wifi", "bàn làm việc", "nhạc nhẹ"],
    features: ["wifi", "cắm sạc", "bàn ngoài trời"],
    description: "Quán cà phê phong cách phòng thí nghiệm hương vị, rất hợp để làm việc.",
    aiInsight: "Phù hợp truy vấn mô tả cozy cafe with wifi trong bán kính 2km.",
    reviews: []
  },
  {
    id: "r-005",
    slug: "pho-24h-ho-guom",
    name: "Phở 24h Hồ Gươm",
    category: "bun-pho",
    categoryLabel: "Phở bò",
    district: "Hoàn Kiếm",
    city: "Hà Nội",
    address: "11 Đinh Liệt, Hoàn Kiếm",
    lat: 21.0337,
    lng: 105.8522,
    priceRange: 1,
    priceLabel: "<100k/người",
    rating: 4.3,
    reviewCount: 670,
    aiMatch: 90,
    distanceKm: 1.1,
    isOpenNow: false,
    openHours: "06:00 - 21:00",
    phone: "024-3828-9000",
    images: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["phở truyền thống", "nước dùng đậm đà"],
    features: ["mang về", "gọi app"],
    description: "Phở bò nấu theo công thức gia truyền, giá bình dân.",
    aiInsight: "Tốt cho truy vấn món nóng ấm giá rẻ vào buổi sáng và tối.",
    reviews: []
  }
];

export const quickCategories = [
  { key: "cafe", label: "Cafe" },
  { key: "nuong", label: "Nướng" },
  { key: "lau", label: "Lẩu" },
  { key: "bun-pho", label: "Bún/Phở" },
  { key: "com", label: "Cơm" }
];

export const profileStats = {
  placesVisited: 128,
  reviewsWritten: 42,
  savedSpots: 85,
  aiAccuracy: 94
};
