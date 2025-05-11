"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface Variable {
  name: string;
  value: string;
}

interface VariablesContextType {
  variables: Variable[];
  addVariable: (name: string, value: string) => void;
  deleteVariable: (name: string) => void;
  getVariableValue: (name: string) => string | undefined;
  substituteVariables: (text: string) => {
    text: string;
    missingVariables: string[];
  };
}

const VariablesContext = createContext<VariablesContextType | undefined>(
  undefined,
);

export const useVariables = () => {
  const context = useContext(VariablesContext);
  if (!context) {
    throw new Error("useVariables must be used within a VariablesProvider");
  }
  return context;
};

export const VariablesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [variables, setVariables] = useState<Variable[]>(() => {
    try {
      const stored = localStorage.getItem("PC_chatVariables");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading variables from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("PC_chatVariables", JSON.stringify(variables));
    } catch (error) {
      console.error("Error saving variables to localStorage:", error);
    }
  }, [variables]);

  const addVariable = (name: string, value: string) => {
    if (variables.length >= 20) {
      throw new Error("Maximum variable limit reached (20)");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      throw new Error(
        "Variable name must contain only alphanumeric characters and underscores",
      );
    }
    if (variables.some((v) => v.name === name)) {
      throw new Error("Variable name must be unique");
    }

    setVariables((prev) => [...prev, { name, value }]);
  };

  const deleteVariable = (name: string) => {
    setVariables((prev) => prev.filter((v) => v.name !== name));
  };

  const getVariableValue = (name: string) => {
    return variables.find((v) => v.name === name)?.value;
  };

  const substituteVariables = (text: string) => {
    const variableRegex = /__\$([a-zA-Z0-9_]+)/g;
    const missingVariables: string[] = [];

    const substitutedText = text.replace(variableRegex, (match, varName) => {
      const value = getVariableValue(varName);
      if (!value) {
        missingVariables.push(varName);
        return match;
      }
      return value;
    });

    return { text: substitutedText, missingVariables };
  };

  const value = {
    variables,
    addVariable,
    deleteVariable,
    getVariableValue,
    substituteVariables,
  };

  return (
    <VariablesContext.Provider value={value}>
      {children}
    </VariablesContext.Provider>
  );
};

export default VariablesContext;
