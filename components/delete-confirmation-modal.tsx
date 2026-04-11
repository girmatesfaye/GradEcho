import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmationModal({
  visible,
  loading = false,
  title = "Delete memory?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-sm rounded-3xl border border-outline-variant/25 bg-surface-container-low p-6">
          <Text className="font-headline text-2xl font-bold text-primary">
            {title}
          </Text>
          <Text className="mt-2 font-body text-sm leading-relaxed text-on-surface-variant">
            {message}
          </Text>
          <View className="mt-6 gap-3">
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="h-12 items-center justify-center rounded-full bg-error"
            >
              <Text className="font-label text-base font-bold text-on-error">
                {loading ? "Deleting..." : confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="h-12 items-center justify-center rounded-full border border-outline-variant/30 bg-surface"
            >
              <Text className="font-label text-base font-medium text-primary">
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
