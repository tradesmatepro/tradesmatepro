import React, { useState, useContext } from 'react';
import { CustomerContext } from '../../contexts/CustomerContext';
import {
  StarIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ReviewModal = ({ isOpen, onClose, workOrder, onReviewSubmitted }) => {
  const { customer, supabase } = useContext(CustomerContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      // Submit the review
      const { data: reviewData, error: reviewError } = await supabase
        .from('marketplace_reviews')
        .insert([{
          customer_id: customer.customer_id,
          company_id: workOrder.company_id,
          work_order_id: workOrder.id,
          marketplace_request_id: workOrder.marketplace_request_id,
          marketplace_response_id: workOrder.marketplace_response_id,
          rating: rating,
          comment: comment.trim() || null,
          review_target: 'COMPANY'
        }])
        .select()
        .single();

      if (reviewError) {
        throw reviewError;
      }

      // Update work order status to indicate review completed
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({ 
          review_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrder.id);

      if (updateError) {
        console.error('Failed to update work order review status:', updateError);
        // Don't throw - the review was successful
      }

      console.log('Review submitted successfully:', reviewData);
      
      // Show success message
      alert('Thank you for your review! Your feedback helps other customers.');
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(reviewData);
      }
      
      // Close modal
      onClose();

    } catch (error) {
      console.error('Failed to submit review:', error);
      
      // Log error
      try {
        await fetch('/error-server/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Failed to submit marketplace review: ${error.message}`,
            error: error.message,
            stack: error.stack,
            context: 'Customer Portal - Submit Review',
            workOrderId: workOrder.id
          })
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (selectedRating) => {
    setHoverRating(selectedRating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Leave a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Work Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{workOrder.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{workOrder.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Contractor:</span>
              <span className="font-medium text-gray-900">{workOrder.companies?.name}</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this service? *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="p-1 transition-colors"
                >
                  {star <= (hoverRating || rating) ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-1" />
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this contractor..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {comment.length}/1000 characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
