import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'react-toastify';

const GET_PENDING_VISITORS = gql`
  query GetPendingVisitors {
    getPendingVisitors {
      email
      name
      idNumber
      idDocType
      dateJoined
    }
  }
`;

const APPROVE_VISITOR = gql`
  mutation ApproveVisitor($email: String!) {
    approveVisitor(email: $email)
  }
`;

const DELETE_USER_ACCOUNT = gql`
  mutation DeleteUserAccount($email: String!) {
    deleteUserAccount(email: $email)
  }
`;

const VisitorApproval = () => {
  const { data, loading, error, refetch } = useQuery(GET_PENDING_VISITORS);
  const [approveVisitor] = useMutation(APPROVE_VISITOR);
  const [deleteUserAccount] = useMutation(DELETE_USER_ACCOUNT);
  const [processingEmails, setProcessingEmails] = useState(new Set());

  const handleApprove = async (email) => {
    if (processingEmails.has(email)) return;
    
    setProcessingEmails(prev => new Set(prev).add(email));
    
    try {
      const result = await approveVisitor({
        variables: { email }
      });
      
      if (result.data.approveVisitor) {
        toast.success(`Visitor ${email} approved successfully!`);
        refetch();
      } else {
        toast.error('Failed to approve visitor');
      }
    } catch (error) {
      console.error('Error approving visitor:', error);
      toast.error('Error approving visitor: ' + error.message);
    } finally {
      setProcessingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  const handleReject = async (email) => {
    if (processingEmails.has(email)) return;
    
    setProcessingEmails(prev => new Set(prev).add(email));
    
    try {
      const result = await deleteUserAccount({
        variables: { email }
      });
      
      if (result.data.deleteUserAccount) {
        toast.success(`Visitor ${email} rejected and removed successfully!`);
        refetch();
      } else {
        toast.error('Failed to reject visitor');
      }
    } catch (error) {
      console.error('Error rejecting visitor:', error);
      toast.error('Error rejecting visitor: ' + error.message);
    } finally {
      setProcessingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  if (loading) return <div className="text-center py-4">Loading pending visitors...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error.message}</div>;

  const pendingVisitors = data?.getPendingVisitors || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Visitor Approval</h2>
      
      {pendingVisitors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No pending visitor registrations</p>
          <p className="text-sm mt-2">All visitor requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingVisitors.map((visitor) => (
            <div key={visitor.email} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{visitor.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Email:</span> {visitor.email}</p>
                    <p><span className="font-medium">ID Number:</span> {visitor.idNumber}</p>
                    <p><span className="font-medium">ID Type:</span> {visitor.idDocType}</p>
                    <p><span className="font-medium">Registration Date:</span> {visitor.dateJoined}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3 ml-4">
                  <button
                    onClick={() => handleApprove(visitor.email)}
                    disabled={processingEmails.has(visitor.email)}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {processingEmails.has(visitor.email) ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleReject(visitor.email)}
                    disabled={processingEmails.has(visitor.email)}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {processingEmails.has(visitor.email) ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitorApproval;