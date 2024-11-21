// Định nghĩa interface cho Course
export interface Course {
  id: string;
  capacity: string;
  dayOfWeek: string;
  description: string;
  duration: string;
  price: string;
  time: string;
  type: string;
}

// Định nghĩa interface cho Instance
export interface Instance {
  id: string;
  comments: string;
  date: string;
  teacher: string;
  courseId: string;
}

// Có thể thêm các interface khác trong tương lai