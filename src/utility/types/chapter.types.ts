export interface ICreateChapter {
  title: string;
  courseId: string;
}

export interface IChapterIds {
  courseId: string;
  chapterId: string;
}

export interface IUpdateChapter extends IChapterIds {
  title?: string;
}

export interface IChapter {
  _id: string;
  title: string;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
