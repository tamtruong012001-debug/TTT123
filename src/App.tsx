import React, { useState, useEffect } from 'react';
import { User, DocumentItem, DocumentType } from './types';
import { DEMO_USERS, INITIAL_DOCUMENTS } from './data/initialData';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DocumentListView } from './components/DocumentListView';
import { DocumentModal } from './components/DocumentModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { DeadlineAlertModal } from './components/DeadlineAlertModal';
import { BackupRestoreView } from './components/BackupRestoreView';
import { UserManagementView } from './components/UserManagementView';
import { UserProfileModal } from './components/UserProfileModal';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

const STORAGE_KEY_USER = 'qlvb_auth_user_v2';
const STORAGE_KEY_USERS_LIST = 'qlvb_users_list_v2';
const STORAGE_KEY_DOCS = 'qlvb_documents_data_v1';

export default function App() {
  // Users list state (multi-account)
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (parsed.length > 0) {
          // Ensure commander name update
          return parsed.map((u) => {
            if (u.username === 'chihuy' && u.fullName.includes('Trần Minh Tuấn')) {
              return { ...u, fullName: 'Trung tá Quách Tấn Đạt' };
            }
            return u;
          });
        }
      }
    } catch (e) {
      console.error('Error loading users list', e);
    }
    return DEMO_USERS;
  });

  // Save users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const match = DEMO_USERS.find((u) => u.username === parsed.username);
        if (match) return match;
        return parsed;
      }
    } catch (e) {
      console.error('Error loading saved user', e);
    }
    return DEMO_USERS[0];
  });

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEY_DOCS);
      if (savedDocs) {
        const parsed: DocumentItem[] = JSON.parse(savedDocs);
        return parsed.map((doc) => {
          if (doc.signer && doc.signer.includes('Trần Minh Tuấn')) {
            return {
              ...doc,
              signer: doc.signer.replace('Đại tá Trần Minh Tuấn', 'Trung tá Quách Tấn Đạt').replace('Trần Minh Tuấn', 'Trung tá Quách Tấn Đạt'),
            };
          }
          return doc;
        });
      }
    } catch (e) {
      console.error('Error loading documents', e);
    }
    return INITIAL_DOCUMENTS;
  });

  // Save documents to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.error('Error saving documents to local storage', e);
    }
  }, [documents]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<DocumentType>('DEN');
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [initialFileForModal, setInitialFileForModal] = useState<File | null>(null);

  const [detailDocument, setDetailDocument] = useState<DocumentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Delete confirmation modal
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Login handler
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {}
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {}
  };

  // Switch between accounts
  const handleSwitchUser = (newUser: User) => {
    // Find freshest record from users list
    const freshUser = users.find((u) => u.id === newUser.id) || newUser;
    setCurrentUser(freshUser);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(freshUser));
    } catch (e) {}
  };

  // Create new user account
  const handleCreateUser = (newUser: Omit<User, 'id'>) => {
    const created: User = {
      ...newUser,
      id: `user-${Date.now()}`,
    };
    setUsers((prev) => [...prev, created]);
  };

  // Update user account (change name, title, department, password, role)
  const handleUpdateUser = (userId: string, updatedData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedData } : u))
    );

    // If current logged-in user is updated, sync currentUser state
    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, ...updatedData };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedCurrent));
      } catch (e) {}
    }
  };

  // Delete user account
  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Update current user profile from Navbar
  const handleUpdateCurrentProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    handleUpdateUser(currentUser.id, updatedData);
  };

  // Open create modal
  const handleOpenCreateModal = (type: 'DEN' | 'DI' = 'DEN', file: File | null = null) => {
    setEditingDocument(null);
    setModalDefaultType(type);
    setInitialFileForModal(file);
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (doc: DocumentItem) => {
    setEditingDocument(doc);
    setModalDefaultType(doc.type);
    setInitialFileForModal(null);
    setIsCreateModalOpen(true);
  };

  // Open detail modal
  const handleOpenDetailModal = (doc: DocumentItem) => {
    setDetailDocument(doc);
    setIsDetailModalOpen(true);
  };

  // Save document (Create or Update)
  const handleSaveDocument = (docData: Partial<DocumentItem>) => {
    const now = new Date().toISOString();

    if (editingDocument) {
      // Update existing
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === editingDocument.id
            ? ({
                ...d,
                ...docData,
                updatedAt: now,
              } as DocumentItem)
            : d
        )
      );
    } else {
      // Create new
      const newDoc: DocumentItem = {
        id: `doc-${docData.type?.toLowerCase() || 'den'}-${Date.now()}`,
        type: docData.type || 'DEN',
        code: docData.code || '',
        incomingNumber: docData.incomingNumber,
        title: docData.title || '',
        category: docData.category || 'Công văn',
        issueDate: docData.issueDate || now.split('T')[0],
        receivedDate: docData.receivedDate,
        sentDate: docData.sentDate,
        senderOrg: docData.senderOrg || '',
        receiverOrg: docData.receiverOrg || '',
        signer: docData.signer || '',
        drafter: docData.drafter,
        assignedTo: docData.assignedTo || '',
        urgency: docData.urgency || 'THUONG',
        security: docData.security || 'THUONG',
        deadline: docData.deadline,
        status: docData.status || (docData.type === 'DEN' ? 'CHO_XU_LY' : 'DU_THAO'),
        directive: docData.directive,
        notes: docData.notes,
        attachmentName: docData.attachmentName,
        attachmentSize: docData.attachmentSize,
        createdAt: now,
        updatedAt: now,
      };

      setDocuments((prev) => [newDoc, ...prev]);
    }
  };

  // Prompt delete document
  const handlePromptDelete = (doc: DocumentItem) => {
    if (!currentUser) return;
    if (currentUser.role !== 'CHIHUY') {
      alert('Quyền bị từ chối: Chỉ tài khoản Chỉ huy mới có quyền xóa văn bản!');
      return;
    }
    setDocToDelete(doc);
    setDeleteError(null);
  };

  // Confirm delete document
  const handleConfirmDelete = () => {
    if (!currentUser || currentUser.role !== 'CHIHUY') {
      setDeleteError('Chỉ Chỉ huy có quyền xóa văn bản khỏi hệ thống!');
      return;
    }
    if (!docToDelete) return;

    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
    setDocToDelete(null);
  };

  // Restore/Backup documents
  const handleRestoreDocuments = (newDocs: DocumentItem[]) => {
    setDocuments(newDocs);
  };

  const handleResetToDefault = () => {
    setDocuments(INITIAL_DOCUMENTS);
  };

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onLogin={handleLogin}
        onCreateUser={handleCreateUser}
      />
    );
  }

  return (
    <div id="app-root" className="min-h-screen relative flex flex-col font-['Plus_Jakarta_Sans'] bg-slate-900">
      {/* Tactical Police CSCĐ Background Image Layer - centered in the main workspace */}
      <div className="fixed top-16 bottom-0 left-0 md:left-64 right-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/cscd-background.jpg"
          alt="Cảnh sát Cơ động CSCĐ"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.06]"
        />
        {/* Soft tactical wash so the officers and backdrop are clearly seen while maintaining reading comfort */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/20 to-slate-950/80" />
      </div>

      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        documents={documents}
        onOpenNotifications={() => setIsAlertModalOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          documents={documents}
          currentUser={currentUser}
          onOpenCreateModal={handleOpenCreateModal}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 md:pl-64 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              documents={documents}
              currentUser={currentUser}
              onNavigateTab={setActiveTab}
              onOpenCreateModal={handleOpenCreateModal}
              onViewDocument={handleOpenDetailModal}
              onEditDocument={handleOpenEditModal}
            />
          )}

          {activeTab === 'incoming' && (
            <DocumentListView
              key="incoming-view"
              documents={documents}
              currentUser={currentUser}
              typeFilter="DEN"
              onViewDocument={handleOpenDetailModal}
              onEditDocument={handleOpenEditModal}
              onDeleteDocument={handlePromptDelete}
              onOpenCreateModal={handleOpenCreateModal}
            />
          )}

          {activeTab === 'outgoing' && (
            <DocumentListView
              key="outgoing-view"
              documents={documents}
              currentUser={currentUser}
              typeFilter="DI"
              onViewDocument={handleOpenDetailModal}
              onEditDocument={handleOpenEditModal}
              onDeleteDocument={handlePromptDelete}
              onOpenCreateModal={handleOpenCreateModal}
            />
          )}

          {activeTab === 'warnings' && (
            <DocumentListView
              key="warnings-view"
              documents={documents}
              currentUser={currentUser}
              typeFilter="WARNINGS"
              onViewDocument={handleOpenDetailModal}
              onEditDocument={handleOpenEditModal}
              onDeleteDocument={handlePromptDelete}
              onOpenCreateModal={handleOpenCreateModal}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              users={users}
              currentUser={currentUser}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {activeTab === 'backup' && (
            <BackupRestoreView
              documents={documents}
              currentUser={currentUser}
              onRestoreDocuments={handleRestoreDocuments}
              onResetToDefault={handleResetToDefault}
            />
          )}
        </main>
      </div>

      {/* User Profile Modal (Change Name & Password) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateCurrentProfile}
      />

      {/* Document Create / Edit Modal */}
      <DocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setInitialFileForModal(null);
        }}
        onSave={handleSaveDocument}
        initialDocument={editingDocument}
        defaultType={modalDefaultType}
        currentUser={currentUser}
        initialFile={initialFileForModal}
      />

      {/* Document Detail Modal */}
      <DocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        document={detailDocument}
        currentUser={currentUser}
        onEdit={handleOpenEditModal}
        onDelete={handlePromptDelete}
      />

      {/* Deadline Notifications Drawer/Modal */}
      <DeadlineAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        documents={documents}
        onSelectDocument={handleOpenDetailModal}
      />

      {/* Delete Confirmation Modal (Chỉ huy được xóa) */}
      {docToDelete && (
        <div
          id="delete-confirmation-overlay"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="delete-confirmation-box"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Xác nhận xóa văn bản
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Bạn đang thực hiện xóa văn bản số <strong className="text-slate-900">{docToDelete.code}</strong>:{' '}
              <span className="italic">"{docToDelete.title}"</span>.
            </p>

            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span>Thao tác này được thực hiện với quyền hạn <strong>Chỉ huy</strong>. Dữ liệu sẽ bị xóa khỏi hệ thống.</span>
            </div>

            {deleteError && (
              <div className="mt-3 p-2.5 bg-red-100 text-red-700 text-xs rounded-lg">
                {deleteError}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                id="btn-cancel-delete"
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                id="btn-confirm-delete"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
