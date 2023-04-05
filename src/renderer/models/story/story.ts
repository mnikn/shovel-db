import { RawJson } from '../../../type';
import { buildFileTreeItem, Folder } from '../explorer';
import { Storylet } from './storylet';

type StoryGroup = Folder;

export class Story {
  public storylets: {
    group: StoryGroup;
    data: Storylet;
  }[] = [];
  public storyGroups: StoryGroup[] = [];

  public addStoryGroup(group: StoryGroup) {
    this.storyGroups.push(group);
  }

  public addStorylet(storylet: Storylet, group: StoryGroup) {
    this.storylets.push({
      group,
      data: storylet,
    });
  }

  public toJson(): any {
    return {
      storyGroups: this.storyGroups.map((item) => item.toJson()),
      storylets: this.storylets.map((item) => {
        return {
          groupId: item.group.id,
          data: item.data.toJson(),
        };
      }),
    };
  }

  public static fromJson(json: RawJson): Story {
    const instance = new Story();

    instance.storyGroups = json.storyGroups.map((item: any) => {
      return buildFileTreeItem(item);
    });

    instance.storylets = json.storylets.map((item: any) => {
      return {
        group: instance.storyGroups.reduce((res: any, g) => {
          if (res) {
            return res;
          }
          if (g.id === item.groupId) {
            return g;
          }
          const matchChild = g.findChildRecursive(item.groupId);
          if (matchChild) {
            return matchChild;
          }
          return res;
        }, undefined),
        data: Storylet.fromJson(item.data),
      };
    });
    instance.storylets = instance.storylets.filter((item) => !!item.group);
    return instance;
  }

  public getStoryletGroup(id: string): StoryGroup | null {
    return this.storyGroups.reduce((res: any, g) => {
      if (res) {
        return res;
      }
      if (g.id === id) {
        return g;
      }
      const matchChild = g.findChildRecursive(id);
      if (matchChild) {
        return matchChild;
      }
      return res;
    }, null);
  }

  public clone(): Story {
    const instance = new Story();
    instance.storylets = this.storylets;
    instance.storyGroups = this.storyGroups;
    return instance;
  }
}
