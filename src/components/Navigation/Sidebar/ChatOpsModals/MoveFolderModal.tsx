import React from "react";
import { Modal, Button, List, App } from "antd";
import { FolderOpenFilled, FolderOutlined } from "@ant-design/icons";
import { ProjectFolder } from "../../../../context/AppContext";

interface MoveFolderModalProps {
  visible: boolean;
  onClose: () => void;
  folders: ProjectFolder[];
  onMoveToFolder: (folderId: string) => void;
}

const MoveFolderModal: React.FC<MoveFolderModalProps> = ({
  visible,
  onClose,
  folders,
  onMoveToFolder,
}) => {
  const { message } = App.useApp();

  return (
    <Modal
      title={
        <>
          <FolderOpenFilled /> Move To Folder
        </>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <p>Where would you like to move the chat to?</p>
      <br />
      <List
        dataSource={folders}
        renderItem={(folder) => (
          <List.Item
            key={folder.id}
            style={{ padding: "18px" }}
            className="hover:bg-gray-50 text-black dark:hover:bg-gray-800 cursor-pointer rounded-md dark:text-white"
            onClick={() => {
              onMoveToFolder(folder.id);
              message.success("Chat moved to folder successfully");
              onClose();
            }}
          >
            <List.Item.Meta
              avatar={
                <FolderOutlined
                  className="text-black dark:text-white"
                  style={{ fontSize: "15px" }}
                />
              }
              title={
                <span className="text-black dark:text-white">
                  {folder.name}
                </span>
              }
              description={
                <span className="text-gray-500 dark:text-gray-400">{`${folder.chatIds.length} chat${folder.chatIds.length !== 1 ? "s" : ""}`}</span>
              }
            />
            <Button type="link" className="text-blue-500 dark:text-blue-300">
              Move Here
            </Button>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default MoveFolderModal;
