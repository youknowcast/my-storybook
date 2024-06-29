import React, {useRef, useState} from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

type Field = {
  id: string;
  content: string;
};

type Section = {
  id: string;
  content: string;
  expanded: boolean;
  items: Field[];
};

type Item = Field | Section;

const initialItems: Item[] = [
  { id: 'item-1', content: 'Item 1' },
  { id: 'item-2', content: 'Item 2' },
  { id: 'item-3', content: 'Item 3' },
  { id: 'section-1', content: 'Section 1', expanded: true, items: [{ id: 'item-5', content: 'Item 5' }, { id: 'item-6', content: 'Item 6' }] },
  { id: 'section-2', content: 'Section 2', expanded: false, items: [{ id: 'item-8', content: 'Item 8' }, { id: 'item-9', content: 'Item 9' }] },
  { id: 'item-7', content: 'Item 7' },
];

type FieldComponentProps = {
  index: number;
  field: Field;
  parentSectionIndex?: number;
}

const FieldComponent = (props: FieldComponentProps) => {
  const { index, field, parentSectionIndex } = props;
  return (
  <Draggable key={field.id} draggableId={field.id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          userSelect: 'none',
          padding: parentSectionIndex ? '0 0 0 40px' : '16px',
          margin: '4px 0',
          border: '1px solid lightgrey',
          borderRadius: '4px',
          backgroundColor: 'white',
          ...provided.draggableProps.style,
        }}
      >
        <div
          style={{
            userSelect: 'none',
            padding: '16px',
            margin: '4px 0',
            border: '1px solid lightgrey',
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          {field.content}
        </div>
      </div>
    )}
  </Draggable>
  )
}

type SectionComponentProps = {
  index: number;
  section: Section;
  toggleExpand: (id: string) => void;
}

const SectionComponent = (props: SectionComponentProps) => {
  const {section, toggleExpand, index} = props;
  const { expanded = true } = section;
  return (
    <Draggable
      key={section.id}
      draggableId={section.id}
      index={index}
      // Section 内の要素を表示しているときは移動不可
      isDragDisabled={section.expanded}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: '16px',
            margin: '4px 0',
            border: '1px solid lightgrey',
            borderRadius: '4px',
            backgroundColor: 'white',
            ...provided.draggableProps.style,
          }}
        >
          <div onClick={() => toggleExpand(section.id)}>{section.content}</div>
        </div>
      )}
    </Draggable>
  )
}

const DnDSingleList: React.FC = () => {
  const [items, setItems] = useState(initialItems);

  const dndIndex = useRef(0);
  const nextDndIndex = () => {
    const index = dndIndex.current;
    dndIndex.current += 1;
    return index;
  }

  const toggleExpand = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        'items' in item && item.id === id
          ? { ...item, expanded: !item.expanded }
          : item
      )
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(source.index, 1);

    if ('items' in newItems[destination.index] && (newItems[destination.index] as Section).expanded) {
      const section = newItems[destination.index] as Section;
      section.items.push(movedItem as Field);
    } else {
      newItems.splice(destination.index, 0, movedItem);
    }

    setItems(newItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
              padding: 8,
              width: 300,
              minHeight: 500,
            }}
          >
            {items.flatMap((item) => {
              if ('items' in item) {
                const section = item as Section;
                const sectionIndex = nextDndIndex();
                const parent = <SectionComponent index={sectionIndex} section={item as Section} toggleExpand={toggleExpand}/>;
                const children = section.items.map((field) => {
                  return <FieldComponent key={field.id} index={nextDndIndex()} field={field} parentSectionIndex={sectionIndex} />;
                } )
                return [
                  parent, ...(section.expanded && children || []),
                ]
              } else {
                return [<FieldComponent index={nextDndIndex()} field={item as Field} />];
              }
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DnDSingleList;
