import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Rate } from 'antd';
import { API_BASE_URL } from '../constants';

interface Review {
  id: string;
  rating: number;
  content: string;
  userId: {
    id: string;
    username: string;
    avatar?: string;
  };
}

interface ReviewCardProps {
  busId: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ busId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      try {
        const response = await axios.get<{ reviews: Review[] }>(`${API_BASE_URL}/bus/review/${busId}`);
        setReviews(response.data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [busId]);

  return (
    <div className='border-t-2 pt-3'>
      <p className='font-semibold text-lg'>Đánh giá cho chuyến xe</p>
      {reviews.length === 0 ? (
        <p>Không có đánh giá nào.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border-2 p-2 rounded-md my-4">
            <div className='flex items-center gap-2'>
              <img
                src={review.userId.avatar}
                className='w-8 h-8 rounded-full'
                alt="User avatar"
              />
              <p className='font-semibold'>
                {review.userId ? review.userId.username : 'Không có thông tin người dùng'}
              </p>
            </div>
            <p className='my-2'>
              <Rate disabled value={review.rating} />
            </p>
            <p>{review.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewCard;

