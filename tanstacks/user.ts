import {
    createUser,
    deleteUser,
    deleteUserDocument,
    getCurrentUser,
    getDeviceSessions,
    getUserById,
    getUserDocuments,
    removeUserProfile,
    removeUserRole,
    renameUserDocument,
    revokeSession,
    setActiveSession,
    updateUser,
    uploadProfileImage,
    uploadUserDocument,
} from "@/actions/user.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

// --- QUERIES (READ) ---

export const useCurrentUser = () => {
    return useQuery({
        queryKey: QUERY_KEYS.user.current,
        queryFn: () => getCurrentUser(),
    });
};

export const useDeviceSessions = () => {
    return useQuery({
        queryKey: QUERY_KEYS.user.deviceSessions,
        queryFn: () => getDeviceSessions(),
    });
};

export const useUserById = (userId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.user.detail(userId),
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });
};

export const useUserDocuments = (userId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.user.documents(userId),
        queryFn: () => getUserDocuments(userId),
        enabled: !!userId,
    });
};

// --- MUTATIONS (CREATE / UPDATE / DELETE) ---

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
        onSuccess: (_res, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => deleteUser(userId),
        onSuccess: (_res, userId) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(userId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
        },
    });
};

export const useUploadProfileImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ formData, userId }: { formData: FormData; userId?: string }) =>
            uploadProfileImage(formData, userId),
        onSuccess: (_res, { userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.current });
            if (userId) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(userId) });
            }
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
        },
    });
};

export const useRemoveUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => removeUserProfile(userId),
        onSuccess: (_res, userId) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.current });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(userId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
        },
    });
};

export const useSetActiveSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionToken: string) => setActiveSession(sessionToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.deviceSessions });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.current });
        },
    });
};

export const useRevokeSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionToken: string) => revokeSession(sessionToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.deviceSessions });
        },
    });
};

export const useUploadUserDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, formData }: { userId: string; formData: FormData }) =>
            uploadUserDocument(userId, formData),
        onSuccess: (_res, { userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.documents(userId) });
        },
    });
};

export const useDeleteUserDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, userId }: { documentId: string; userId: string }) =>
            deleteUserDocument(documentId),
        onSuccess: (_res, { userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.documents(userId) });
        },
    });
};

export const useRenameUserDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, newName, userId }: { documentId: string; newName: string; userId: string }) =>
            renameUserDocument(documentId, newName),
        onSuccess: (_res, { userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.documents(userId) });
        },
    });
};

export const useRemoveUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, roleToRemove }: { userId: string; roleToRemove: string }) =>
            removeUserRole(userId, roleToRemove),
        onSuccess: (_res, { userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(userId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
        },
    });
};
