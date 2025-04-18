"use client"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import type { WidgetConfig } from "./dashboard"
import Widget from "./widget"
import type { Visit, Employee, Group } from "@/types"

interface WidgetGridProps {
  widgets: WidgetConfig[]
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  currentUser: {
    id: string
    username: string
    isAdmin: boolean
  }
  isEditMode: boolean
  onRemoveWidget: (widgetId: string) => void
  onReorderWidgets: (startIndex: number, endIndex: number) => void
  onUpdateWidgetSettings: (widgetId: string, settings: Record<string, any>) => void
  onResizeWidget: (widgetId: string, size: "small" | "medium" | "large") => void
}

export default function WidgetGrid({
  widgets,
  visits,
  employees,
  groups,
  currentUser,
  isEditMode,
  onRemoveWidget,
  onReorderWidgets,
  onUpdateWidgetSettings,
  onResizeWidget,
}: WidgetGridProps) {
  // 드래그 앤 드롭 처리
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.index !== destination.index) {
      onReorderWidgets(source.index, destination.index)
    }
  }

  // 위젯 크기에 따른 클래스 결정
  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1"
      case "large":
        return "col-span-3"
      case "medium":
      default:
        return "col-span-2"
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="widgets" direction="horizontal">
        {(provided) => (
          <div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {widgets
              .sort((a, b) => a.position - b.position)
              .map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!isEditMode}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${getWidgetSizeClass(widget.size)} ${snapshot.isDragging ? "opacity-70" : ""}`}
                    >
                      <Widget
                        config={widget}
                        visits={visits}
                        employees={employees}
                        groups={groups}
                        currentUser={currentUser}
                        isEditMode={isEditMode}
                        dragHandleProps={provided.dragHandleProps}
                        onRemove={() => onRemoveWidget(widget.id)}
                        onUpdateSettings={(settings) => onUpdateWidgetSettings(widget.id, settings)}
                        onResize={(size) => onResizeWidget(widget.id, size)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
