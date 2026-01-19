'use client';

import { Check, Clock, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DELIVERABLE_TYPE_OPTIONS, DELIVERABLE_STATUS_OPTIONS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import type { Deliverable } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface DeliverablesListProps {
  deliverables: Deliverable[];
  onSubmit?: (id: string, url: string, notes?: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
}

export function DeliverablesList({ 
  deliverables, 
  onSubmit, 
  onApprove, 
  onReject 
}: DeliverablesListProps) {
  const { profile } = useAuth();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isInfluencer = profile?.role === 'influencer';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleSubmit = async () => {
    if (!selectedDeliverable || !submissionUrl) return;
    
    setIsLoading(true);
    try {
      await onSubmit?.(selectedDeliverable.id, submissionUrl, submissionNotes);
      setSubmitDialogOpen(false);
      setSubmissionUrl('');
      setSubmissionNotes('');
      setSelectedDeliverable(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsLoading(true);
    try {
      await onApprove?.(id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDeliverable || !rejectionReason) return;
    
    setIsLoading(true);
    try {
      await onReject?.(selectedDeliverable.id, rejectionReason);
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedDeliverable(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliverables.map((deliverable) => {
              const typeOption = DELIVERABLE_TYPE_OPTIONS.find(t => t.value === deliverable.type);
              const statusOption = DELIVERABLE_STATUS_OPTIONS.find(s => s.value === deliverable.status);

              return (
                <div
                  key={deliverable.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="mt-0.5">
                    {getStatusIcon(deliverable.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{deliverable.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {typeOption?.label || deliverable.type}
                      </Badge>
                      <Badge
                        variant={
                          deliverable.status === 'approved' ? 'success' :
                          deliverable.status === 'submitted' ? 'info' :
                          deliverable.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {statusOption?.label || deliverable.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {deliverable.description}
                    </p>

                    {deliverable.submission_url && (
                      <a
                        href={deliverable.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 block"
                      >
                        View Submission
                      </a>
                    )}

                    {deliverable.rejection_reason && (
                      <p className="text-sm text-red-600 mt-2">
                        Revision needed: {deliverable.rejection_reason}
                      </p>
                    )}

                    {deliverable.approved_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Approved on {formatDate(deliverable.approved_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Influencer: Submit button */}
                    {isInfluencer && (deliverable.status === 'pending' || deliverable.status === 'rejected') && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDeliverable(deliverable);
                          setSubmitDialogOpen(true);
                        }}
                      >
                        Submit
                      </Button>
                    )}

                    {/* Brand: Approve/Reject buttons */}
                    {!isInfluencer && deliverable.status === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(deliverable.id)}
                          disabled={isLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedDeliverable(deliverable);
                            setRejectDialogOpen(true);
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {deliverables.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No deliverables yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Deliverable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Submission URL *</Label>
              <Input
                placeholder="https://..."
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes about this submission..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!submissionUrl || isLoading}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for rejection *</Label>
              <Textarea
                placeholder="Please explain what needs to be changed..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={!rejectionReason || isLoading}
            >
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
