// ============================================================
// src/features/missing-bikes/hooks.ts
// ============================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getActiveMissingBikes,
  getAllMissingBikes,
  getMissingBikeById,
  getMyMissingReports,
  createMissingBikeReport,
  updateMissingBikeReport,
  markAsRecovered,
  uploadMissingBikePhotos,
  getMissingBikeComments,
  addMissingBikeComment,
} from "./service";

import { bikeKeys } from "@/features/bikes/hooks";
import { feedKeys } from "@/features/feed/hooks";

// ============================================================
// Query Keys
// ============================================================

export const missingKeys = {
  root: ["missing-bikes"] as const,
  active: ["missing-bikes", "active"] as const,
  all: ["missing-bikes", "all"] as const,
  mine: (userId: string) =>
    ["missing-bikes", "mine", userId] as const,
  detail: (reportId: string) =>
    ["missing-bikes", "detail", reportId] as const,
  comments: (reportId: string) =>
    ["missing-bikes", "comments", reportId] as const,
};

// ============================================================
// Queries
// ============================================================

export function useActiveMissingBikes() {
  return useQuery({
    queryKey: missingKeys.active,
    queryFn: getActiveMissingBikes,
  });
}

export function useAllMissingBikes() {
  return useQuery({
    queryKey: missingKeys.all,
    queryFn: getAllMissingBikes,
  });
}

export function useMissingBikeById(id: string) {
  return useQuery({
    queryKey: missingKeys.detail(id),
    queryFn: () => getMissingBikeById(id),
    enabled: !!id,
  });
}

export function useMyMissingReports(ownerId: string) {
  return useQuery({
    queryKey: missingKeys.mine(ownerId),
    queryFn: () => getMyMissingReports(ownerId),
    enabled: !!ownerId,
  });
}

// ============================================================
// Mutations
// ============================================================

export function useCreateMissingReport() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createMissingBikeReport,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: missingKeys.root,
      });

      qc.invalidateQueries({
        queryKey: bikeKeys.root,
      });

      qc.invalidateQueries({
        queryKey: feedKeys.all,
      });
    },
  });
}

export function useUpdateMissingReport(reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      updates: Parameters<typeof updateMissingBikeReport>[1]
    ) => updateMissingBikeReport(reportId, updates),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: missingKeys.detail(reportId),
      });

      qc.invalidateQueries({
        queryKey: missingKeys.root,
      });
    },
  });
}

export function useMarkAsRecovered() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      bikeId,
    }: {
      reportId: string;
      bikeId: string;
    }) => markAsRecovered(reportId, bikeId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: missingKeys.root,
      });

      qc.invalidateQueries({
        queryKey: bikeKeys.root,
      });

      qc.invalidateQueries({
        queryKey: feedKeys.all,
      });
    },
  });
}

export function useUploadMissingPhotos() {
  return useMutation({
    mutationFn: ({
      ownerId,
      reportId,
      files,
    }: {
      ownerId: string;
      reportId: string;
      files: File[];
    }) =>
      uploadMissingBikePhotos(ownerId, reportId, files),
  });
}

export function useMissingBikeComments(reportId: string) {
  return useQuery({
    queryKey: missingKeys.comments(reportId),
    queryFn: () => getMissingBikeComments(reportId),
    enabled: !!reportId,
  });
}

export function useAddMissingBikeComment(reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: addMissingBikeComment,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: missingKeys.comments(reportId),
      });

      qc.invalidateQueries({
        queryKey: missingKeys.detail(reportId),
      });
    },
  });
}