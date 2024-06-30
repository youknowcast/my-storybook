import React, {useEffect, useRef, useState} from 'react';
import {DragDropContext, Droppable, Draggable, DropResult, DragUpdate, DragStart} from 'react-beautiful-dnd';

type Field = {
  id: string;
  content: string;
  // section 配下の場合の親 section の flatmap 上の index
  parentIndex?: number;
  // flatmap 上の index
  // 実際には id で管理できるかもしれない
  index?: number;
  // 自分の所属する root/section 上の index
  localIndex?: number;
};

type Section = {
  id: string;
  content: string;
  expanded: boolean;
  items: Field[];
  // flatmap 上の index
  index?: number;
  // root 上の index
  localIndex?: number;
};

type Item = Field | Section;

const isSection = (item: Item) => 'items' in item;

const initialItems: Item[] = [
  { id: 'item-1', content: 'Item 1' },
  { id: 'item-2', content: 'Item 2' },
  { id: 'item-3', content: 'Item 3' },
  { id: 'section-1', content: 'Section 1', expanded: true, items: [{ id: 'item-5', content: 'Item 5' }, { id: 'item-6', content: 'Item 6' }] },
  { id: 'section-2', content: 'Section 2', expanded: false, items: [{ id: 'item-8', content: 'Item 8' }, { id: 'item-9', content: 'Item 9' }] },
  { id: 'item-7', content: 'Item 7' },
];

type FieldComponentProps = {
  field: Field;
  parentSectionIndex?: number;
}

const FieldComponent = (props: FieldComponentProps) => {
  const { field, parentSectionIndex } = props;
  const { index } = field;

  if (index === undefined) throw new Error('Field index is required');

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
            padding: '4px',
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
  section: Section;
  toggleExpand: (id: string) => void;
}

const SectionComponent = (props: SectionComponentProps) => {
  const {section, toggleExpand } = props;
  const { expanded = true, index } = section;

  if (index === undefined) throw new Error('Section index is required');

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
            padding: '4px',
            margin: '4px 0',
            border: '1px solid lightgrey',
            borderRadius: '4px',
            backgroundColor: 'white',
            ...provided.draggableProps.style,
          }}
        >

          <div onClick={() => toggleExpand(section.id)}>[{section.expanded ? '閉' : '開' }] {section.content}</div>
        </div>
      )}
    </Draggable>
  )
}

const DebugList = (props : { items: Item[] }) => {
  const { items } = props;

  return (
    <div>
      {items.map((item, index) => {
        const children = 'items' in item ? (item as Section).items.map((entry, idx) => <div key={idx}>-- {entry.id}</div>) : undefined;
        return (
          <>
            <div key={index}>{item.id}</div>
            {children}
          </>
        );
      })}
    </div>
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

  const withIndex = (item: Item, index: number, localIndex: number, parentIndex?: number): Item => {
    return { ...item, index, localIndex, parentIndex };
  }
  const itemsToFlatItems = (items: Item[]) => {
    return items.flatMap((entry, index) => {
      if ('items' in entry) {
        const section = withIndex(entry, nextDndIndex(), index) as Section;
        const children = section.items.map((entry, idx) => withIndex(entry, nextDndIndex(), idx, section.index));
        return [section, ...children];
      }
      return [withIndex(entry, nextDndIndex(), index)];
    })
  }
  const [flatItems, setFlatItems] = useState<Item[]>(itemsToFlatItems(items));
  useEffect(() => {
    setFlatItems(itemsToFlatItems(items))
  }, [items])

  const toggleExpand = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        isSection(item) && item.id === id
          ? { ...item, expanded: !item.expanded }
          : item
      )
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const srcItem = flatItems.find((entry) => entry.index === source.index);
    const dstItem = flatItems.find((entry) => entry.index === destination.index);
    if (srcItem === undefined || dstItem === undefined) throw new Error('dnd src and dst item are required');

    const newItems = Array.from(items);

    const parentSection = (item: Item) => {
      if (!isSection(item) && item.parentIndex !== undefined) {
        return flatItems.find((entry) => entry.index === item.parentIndex) as Section;
      }
      return undefined;
    }

    if (isSection(srcItem)) {
      if (srcItem.expanded) return;

      const [movedItem] = newItems.splice(srcItem.localIndex!, 1);
      const section = parentSection(dstItem);
      const dstLocalIndex = section ? section.localIndex! : dstItem.localIndex!;
      newItems.splice(dstLocalIndex, 0, movedItem);
    }

    setItems(newItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <DebugList items={items} />
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
            {flatItems.map((item) => {
              if ('items' in item) {
                return <SectionComponent key={item.id} section={item} toggleExpand={toggleExpand}/>;
             } else {
                const field = item as Field;
                if (field.parentIndex !== undefined) {
                  const parent = flatItems.find((entry) => entry.index === field.parentIndex);
                  if (parent === undefined) throw new Error('parent section is not found');
                  return (parent as Section).expanded ?
                    <FieldComponent key={field.id} field={field} parentSectionIndex={field.parentIndex} /> : undefined;
                }
                return <FieldComponent key={field.id} field={field} parentSectionIndex={field.parentIndex} />;
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
