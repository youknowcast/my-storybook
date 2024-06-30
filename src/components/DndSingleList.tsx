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

const isAdditional = (item: Item) => isSection(item) && item.expanded;

const initialItems: Item[] = [
  { id: 'item-1', content: 'Item 1' },
  { id: 'item-2', content: 'Item 2' },
  { id: 'item-3', content: 'Item 3' },
  { id: 'section-1', content: 'Section 1', expanded: true, items: [{ id: 'item-5', content: 'Item 5' }, { id: 'item-6', content: 'Item 6' }] },
  { id: 'section-2', content: 'Section 2', expanded: true, items: [{ id: 'item-7', content: 'Item 7' }, { id: 'item-8', content: 'Item 8' }] },
  { id: 'section-3', content: 'Section 3', expanded: true, items: [{ id: 'item-9', content: 'Item 9' }, { id: 'item-10', content: 'Item 10' }] },
  { id: 'item-11', content: 'Item 11' },
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

          <div onClick={() => toggleExpand(section.id)}>[{expanded ? '閉' : '開' }] {section.content}</div>
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
        // expanded でないときに flatItems と items のデータ量に齟齬が出てしまうが，
        // react-beautiful-dnd の <Draggable /> はキーを連番で生成しないと動作がおかしくなるため，許容する．
        const children = section.expanded ? section.items.map((entry, idx) => withIndex(entry, nextDndIndex(), idx, section.index)) : [];
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
        const section = flatItems.find((entry) => entry.index === item.parentIndex) as Section;
        return isAdditional(section) ? section : undefined;
      }
      return undefined;
    }

    if (isSection(srcItem)) {
      // section を移動する場合
      if (srcItem.expanded) return;

      const [movedItem] = newItems.splice(srcItem.localIndex!, 1);
      // dst が section.items だった場合は，親 section を swap 対象とみなす
      const section = parentSection(dstItem);
      const dstLocalIndex = section ? section.localIndex! : dstItem.localIndex!;
      newItems.splice(dstLocalIndex, 0, movedItem);
    } else {
      // Field を移動する場合
      const srcParent = parentSection(srcItem);

      // section が絡んだ移動について
      //
      // [リスト上部から下部への移動]
      //
      // section1
      //   - field1 // ★
      // section2
      //     (1)
      //   - field2
      //     (2)
      //   - field3
      //     (3)
      //
      // (2) (3) は dst = field2, field3 になるため，dstParent = section2 となる．
      // (1) は dst = section2 となり，dstParent = undefined となるため，そのまま dst を評価して移動対象である
      // section2 を取得する．
      //
      // [リスト下部から上部への移動]
      // 以下のような並びについて， field3 を (1) (2) (3) に動かすことを考える．
      //
      // section1
      //     (1)
      //   - field1
      //     (2)
      //   - field2
      //     (3)
      // section2
      //   - field3 // ★
      //
      // (1) (2) は dst = field1, field2 になるため，dstParent = section1 となる．
      // (3) は dst = section2 となり，dstParent = undefined となるため，ひとつ上の field2(sibling) を取り，
      // その親(dstSiblingParent)を解決することで移動対象である section1 を取得する．
      // なお，ひとつ上の section.items が空だった場合はそのまま sibling を section として評価する．
      //
      // また，上から下，下から上の移動で section が絡む場合，index の補正が必要になるため，
      // 判定に必要な情報(toUp/toDown)を返却する．
      //
      // also see: dstSectionItemsLocalIndex
      const resolveDstSection = (srcItem: Item, dstItem: Item): [Section|undefined, 'toUp'|'toDown'] => {
        if (srcItem.index! < dstItem.index!) {
          // 上部から下部への移動
          const dstParent = parentSection(dstItem);
          const self = isAdditional(dstItem) ? dstItem as Section : undefined;
          return [ dstParent || self, 'toDown'];
        } else {
          // 下部から上部への移動
          const dstParent = parentSection(dstItem);
          const sibling = flatItems.find((entry) => entry.index === (dstItem.index! - 1))
          const dstSiblingParent = (() => {
            if (!sibling) return undefined;
            if (isAdditional(sibling)) return sibling as Section;
            return parentSection(sibling);
          })();
          return [dstParent || dstSiblingParent, 'toUp'];
        }
      }
      const [dstParent, direction] = resolveDstSection(srcItem, dstItem);

      // section.items が関係する移動の際に localIndex を調整する
      const dstSectionItemsLocalIndex = (dstItem: Item, newItems: Item[], direction: 'toUp' | 'toDown') => {
        if (direction === 'toUp') {
          // 下から持ってきたときに，section が dst だった場合は一番下につける
          return isSection(dstItem) ? newItems.length : dstItem.localIndex!;
        } else {
          // 上から持ってきたときに，section が dst だった場合は先頭にいれる
          // また，上を抜いて持ってくるため， index が 1 ずれる(そのままの index を適用すると，
          // 挿入しようとした位置の 1 つ下に配置される)のを補正する
          return isSection(dstItem) ? 0 : dstItem.localIndex! + 1;
        }
      }

      if (srcParent !== undefined) {
        if (dstParent !== undefined && srcParent.index === dstParent.index) {
          // 同じ section 内の移動
          const section = newItems[srcParent.localIndex!] as Section;
          const newSectionItems = Array.from(section.items);
          const [removed] = newSectionItems.splice(srcItem.localIndex!, 1);
          newSectionItems.splice(dstItem.localIndex!, 0, removed);
          newItems[srcParent.localIndex!] = {...section, items: newSectionItems};
        } else if (dstParent !== undefined) {
          // 異なる section 間の移動
          const srcSection = newItems[srcParent.localIndex!] as Section;
          const dstSection = newItems[dstParent.localIndex!] as Section;

          const newSrcItems = Array.from(srcSection.items);
          const [removed] = newSrcItems.splice(srcItem.localIndex!, 1);
          const newDstItems = Array.from(dstSection.items);
          newDstItems.splice(dstSectionItemsLocalIndex(dstItem, newDstItems, direction), 0, removed);

          newItems[srcParent.localIndex!] = { ...srcSection, items: newSrcItems };
          newItems[dstParent.localIndex!] = { ...dstSection, items: newDstItems };
        } else {
          // root への移動
          const srcSection = newItems[srcParent.localIndex!] as Section;
          const newSrcItems = Array.from(srcSection.items);
          const [removed] = newSrcItems.splice(srcItem.localIndex!, 1);

          newItems[srcParent.localIndex!] = { ...srcSection, items: newSrcItems };
          // section.items => root で上から下方向の移動の場合，index が 1 ずれるのを調整する
          const dstLocalIndex = direction === 'toDown' ? dstItem.localIndex! + 1 : dstItem.localIndex!;
          newItems.splice(dstLocalIndex, 0, removed);
        }
      } else if (dstParent !== undefined) {
        // root から section への移動
        const dstSection = newItems[dstParent.localIndex!] as Section;
        const newSectionItems = Array.from(dstSection.items);
        const newDstPrent = newItems[dstParent.localIndex!] as Section;

        const [removed] = newItems.splice(srcItem.localIndex!, 1);
        newSectionItems.splice(dstSectionItemsLocalIndex(dstItem, newSectionItems, direction), 0, removed);
        newDstPrent.items = newSectionItems;
      } else {
        // root から root への移動
        const [removed] = newItems.splice(srcItem.localIndex!, 1);
        newItems.splice(dstItem.localIndex!, 0, removed);
      }
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
