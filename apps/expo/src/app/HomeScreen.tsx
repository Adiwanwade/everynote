import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  RichText,
  Toolbar,
  useEditorBridge,
  PlaceholderBridge,
  TenTapStartKit,
  CoreBridge,
  CodeBridge, // <-- Add this import
} from "@10play/tentap-editor";
import Placeholder from "@tiptap/extension-placeholder";

// Custom CSS for code blocks
const customCodeBlockCSS = `
  code {
    background-color: #2a2a2a;
    color: #ffffff;
    padding: 2px 4px;
    border-radius: 4px;
  }
  pre {
    background-color: #2a2a2a;
    color: #ffffff;
    padding: 10px;
    border-radius: 8px;
  }
`;

// Custom CSS for placeholder
const customPlaceholderCSS = `
  .is-editor-empty::before {
    content: attr(data-placeholder);
    font-size: 1.2rem;
    font-family: 'Georgia', serif;
    color: #888;
    font-style: italic;
    opacity: 0.8;
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

const categories = ["General", "Meeting", "To-Do"];

const formatDate = () => {
  const date = new Date();
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [searchText, setSearchText] = useState("");

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: "",
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(`
        body {
          background: #000000;
          color: #fff;
        }
        .ProseMirror {
          background: #000000;
          color: #fff;
        }
        ${customPlaceholderCSS}
      `),
      CodeBridge.configureCSS(customCodeBlockCSS),
      PlaceholderBridge.configureExtension({
        placeholder: "What is on your mind today?",
      }),
    ],
    theme: {
      toolbar: {
        toolbarBody: {
          borderTopColor: "#222",
          borderBottomColor: "#222",
          backgroundColor: "#181818",
        },
      },
      colorKeyboard: {
        keyboardRootColor: "#181818",
        colorSelection: [
          {
            name: "Red",
            value: "#E5112B",
            displayColor: "#E5112B",
          },
          {
            name: "White",
            value: "#fff",
            displayColor: "#fff",
          },
        ],
      },
      webview: {
        backgroundColor: "#1C1C1E",
      },
      webviewContainer: {},
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes"
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="calendar-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>U</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.activeCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.createCategoryButton}>
            <Text style={styles.createCategoryText}>+ Create Category</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>

      {/* Editor */}
      <View style={styles.editorContainer}>
        {/* <Text style={styles.editorPrompt}>What's on your mind today?</Text> */}

        {/* Wrap RichText in a View with custom styles */}
        <View style={styles.editorWrapper}>
          <RichText
            editor={editor}
            style={{
              ...styles.richEditor,
              backgroundColor: "#000000",
              borderColor: "#e45d5d",
            }}
          />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 75,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 28,
    paddingHorizontal: 15,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 32,
    height: 32,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
  },
  activeCategoryButton: {
    backgroundColor: "#FFFFFF",
  },
  categoryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#000000",
  },
  createCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
    borderStyle: "dashed",
  },
  createCategoryText: {
    color: "#666",
    fontSize: 14,
  },
  dateContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateText: {
    color: "#666",
    fontSize: 14,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  editorPrompt: {
    color: "#ffffff",
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 16,
  },
  editorWrapper: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,

    borderWidth: 1,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  richEditor: {
    flex: 1,
    color: "000000",
  },
  keyboardAvoidingView: {
    position: "absolute",
    width: "110%",
    bottom: 0,
  },
});
