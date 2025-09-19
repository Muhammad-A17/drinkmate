"use client";

import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { shopAPI } from "@/lib/api";
import { toast } from "sonner";

interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  date: string;
  helpful?: number;
  notHelpful?: number;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
}

export default function ProductReviews({ productId, reviews = [] }: ProductReviewsProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewList, setReviewList] = useState<Review[]>(reviews);
  const { isAuthenticated, user } = useAuth();
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Call your API to submit the review
      const response = await shopAPI.addReview(productId, {
        rating,
        title,
        comment
      });
      
      if (response.success) {
        toast.success("Your review has been submitted");
        // Add the new review to the list
        setReviewList([
          {
            _id: response.review._id || `temp-${Date.now()}`,
            user: {
              _id: user?._id || "",
              username: user?.username || "Anonymous",
              avatar: undefined
            },
            rating,
            title,
            comment,
            date: new Date().toISOString(),
            helpful: 0,
            notHelpful: 0
          },
          ...reviewList
        ]);
        
        // Reset the form
        setRating(5);
        setTitle("");
        setComment("");
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred while submitting your review");
    } finally {
      setSubmitting(false);
    }
  };
  
  const calculateAverageRating = () => {
    if (reviewList.length === 0) return 0;
    const sum = reviewList.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviewList.length;
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    // In a real app, this would call an API to update the review
    setReviewList(prev => prev.map(review => {
      if (review._id === reviewId) {
        if (isHelpful) {
          return { ...review, helpful: (review.helpful || 0) + 1 };
        } else {
          return { ...review, notHelpful: (review.notHelpful || 0) + 1 };
        }
      }
      return review;
    }));
    
    toast.success(`You marked this review as ${isHelpful ? 'helpful' : 'not helpful'}`);
  };
  
  return (
    <div>
      {/* Review summary */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {calculateAverageRating().toFixed(1)}
              <span className="text-xl text-gray-500">/5</span>
            </div>
            <div className="flex items-center justify-center md:justify-start mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${
                    i < Math.round(calculateAverageRating()) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-gray-300"
                  }`} 
                />
              ))}
            </div>
            <p className="text-gray-500">
              Based on {reviewList.length} {reviewList.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          
          <div className="flex-1 w-full">
            {/* Rating breakdown */}
            {[5, 4, 3, 2, 1].map(num => {
              const count = reviewList.filter(r => r.rating === num).length;
              const percentage = reviewList.length > 0 
                ? (count / reviewList.length) * 100 
                : 0;
              
              return (
                <div key={num} className="flex items-center mb-1">
                  <div className="flex items-center w-24">
                    <span className="text-sm text-gray-600 mr-2">{num} star</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-3 h-3 ${
                            i < num ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 ml-4 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Write a review */}
      <div className="mb-10 border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>
        
        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="p-1"
                    aria-label={`Rate ${i + 1} star${i + 1 > 1 ? 's' : ''}`}
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="reviewTitle" className="block text-gray-700 mb-2">
                Review Title (optional)
              </label>
              <input
                id="reviewTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#12d6fa]"
                placeholder="Summarize your experience"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="reviewComment" className="block text-gray-700 mb-2">
                Your Review
              </label>
              <Textarea
                id="reviewComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px]"
                placeholder="Share your experience with this product"
              />
            </div>
            
            <Button 
              type="submit" 
              className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-colors"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">Please login to leave a review</p>
            <Button 
              onClick={() => {/* Handle navigation to login */}}
              className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-colors"
            >
              Login to Review
            </Button>
          </div>
        )}
      </div>
      
      {/* Reviews list */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Customer Reviews ({reviewList.length})
        </h3>
        
        {reviewList.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviewList.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={review.user.avatar} />
                      <AvatarFallback>
                        <UserCircle className="w-10 h-10 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-800">
                        {review.user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="text-lg font-medium text-gray-800 mb-2">{review.title}</h4>
                )}
                
                <p className="text-gray-700 mb-4">{review.comment}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">Was this review helpful?</span>
                  <button 
                    onClick={() => handleHelpful(review._id, true)}
                    className="flex items-center mr-3 hover:text-gray-800"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {review.helpful || 0}
                  </button>
                  <button 
                    onClick={() => handleHelpful(review._id, false)}
                    className="flex items-center hover:text-gray-800"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {review.notHelpful || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
